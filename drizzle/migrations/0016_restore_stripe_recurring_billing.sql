ALTER TABLE public.organizations ALTER COLUMN trial_ends_at SET DEFAULT NULL;
REVOKE ALL ON FUNCTION public.process_hotmart_event(text,text,timestamptz,text,text,text) FROM PUBLIC, anon, authenticated, service_role;
COMMENT ON FUNCTION public.process_hotmart_event(text,text,timestamptz,text,text,text) IS 'DEPRECATED: Hotmart retired; historical paid subscription rows retained for continuity.';
CREATE OR REPLACE FUNCTION public.reserve_subscription_checkout(_organization_id uuid, _user_id uuid, _environment text, _price_id text)
RETURNS public.subscription_checkouts LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.subscription_checkouts;
BEGIN
 IF _environment NOT IN ('sandbox','live') OR _price_id NOT IN ('pontotech_monthly','pontotech_quarterly','pontotech_yearly') THEN RAISE EXCEPTION 'Plano inválido'; END IF;
 PERFORM 1 FROM public.organizations WHERE id=_organization_id FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM public.organization_members WHERE organization_id=_organization_id AND user_id=_user_id AND active AND role IN ('owner','admin')) THEN RAISE EXCEPTION 'Sem permissão para contratar'; END IF;
 IF EXISTS(SELECT 1 FROM public.subscriptions WHERE organization_id=_organization_id AND environment=_environment AND gateway_subscription_id LIKE 'sub_%' AND (status IN ('active','trialing','past_due','paused','pending','incomplete') OR (status='canceled' AND current_period_end>now()))) THEN RAISE EXCEPTION 'Sua empresa já possui assinatura Stripe. Gerencie a assinatura atual.'; END IF;
 SELECT * INTO r FROM public.subscription_checkouts WHERE organization_id=_organization_id AND environment=_environment AND status='pending' AND expires_at>now() ORDER BY created_at DESC LIMIT 1;
 IF r.id IS NOT NULL THEN
  IF r.price_id<>_price_id THEN RAISE EXCEPTION 'Existe um pagamento em aberto para outro ciclo. Aguarde 30 minutos.'; END IF;
  IF r.gateway_session_id IS NULL THEN RAISE EXCEPTION 'Pagamento sendo preparado. Tente novamente em instantes.'; END IF;
  RETURN r;
 END IF;
 INSERT INTO public.subscription_checkouts(organization_id,user_id,environment,price_id) VALUES(_organization_id,_user_id,_environment,_price_id) RETURNING * INTO r;
 RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.reserve_subscription_checkout(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_subscription_checkout(uuid,uuid,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.process_subscription_payment(_event_id text,_environment text,_occurred_at timestamptz,_event_type text,_payload jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE intent public.subscription_checkouts; sub public.subscriptions; sub_id text; new_status text; new_price text; paid boolean;
BEGIN
 IF _environment NOT IN ('sandbox','live') OR _event_id IS NULL OR _occurred_at IS NULL THEN RAISE EXCEPTION 'Evento inválido'; END IF;
 IF _event_type NOT IN ('checkout.completed','subscription.upsert','subscription.canceled','invoice.paid','invoice.payment_failed','payment.revoked') THEN RAISE EXCEPTION 'Evento não suportado'; END IF;
 sub_id:=_payload->>'subscriptionId';
 IF sub_id IS NULL OR sub_id NOT LIKE 'sub_%' THEN RAISE EXCEPTION 'Assinatura Stripe inválida'; END IF;
 INSERT INTO public.subscription_payment_events(event_id,environment,occurred_at) VALUES(_environment||':'||_event_id,_environment,_occurred_at) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN; END IF;
 SELECT * INTO sub FROM public.subscriptions WHERE gateway_subscription_id=sub_id AND environment=_environment FOR UPDATE;
 IF sub.id IS NULL THEN
  IF _event_type NOT IN ('checkout.completed','invoice.paid') THEN RAISE EXCEPTION 'Aguardando confirmação da contratação'; END IF;
  SELECT * INTO intent FROM public.subscription_checkouts WHERE id::text=_payload->>'checkoutId' AND environment=_environment FOR UPDATE;
  IF intent.id IS NULL OR intent.gateway_session_id IS DISTINCT FROM _payload->>'sessionId' OR intent.price_id IS DISTINCT FROM _payload->>'priceId' THEN RAISE EXCEPTION 'Pagamento sem contratação correspondente'; END IF;
  PERFORM 1 FROM public.organizations WHERE id=intent.organization_id FOR UPDATE;
  IF NOT EXISTS(SELECT 1 FROM public.organization_members WHERE organization_id=intent.organization_id AND user_id=intent.user_id AND active AND role IN ('owner','admin')) THEN RAISE EXCEPTION 'Responsável não autorizado'; END IF;
  IF EXISTS(SELECT 1 FROM public.subscriptions WHERE organization_id=intent.organization_id AND environment=_environment AND gateway_subscription_id LIKE 'sub_%' AND status IN ('active','trialing','past_due','paused','pending','incomplete')) THEN RAISE EXCEPTION 'Assinatura Stripe duplicada'; END IF;
  INSERT INTO public.subscriptions(user_id,organization_id,gateway_subscription_id,gateway_customer_id,product_id,price_id,status,environment) VALUES(intent.user_id,intent.organization_id,sub_id,_payload->>'customerId','serviceproos',intent.price_id,'pending',_environment) RETURNING * INTO sub;
 END IF;
 IF sub.last_event_at IS NOT NULL AND sub.last_event_at>_occurred_at THEN RETURN; END IF;
 new_price:=coalesce(_payload->>'priceId',sub.price_id);
 IF new_price NOT IN ('pontotech_monthly','pontotech_quarterly','pontotech_yearly') THEN RAISE EXCEPTION 'Plano inválido'; END IF;
 paid:=_event_type IN ('checkout.completed','invoice.paid');
 new_status:=CASE WHEN _event_type='payment.revoked' THEN 'unpaid' WHEN _event_type='subscription.canceled' THEN 'canceled' WHEN _event_type='invoice.payment_failed' THEN 'past_due' WHEN paid THEN coalesce(_payload->>'status','active') ELSE coalesce(_payload->>'status',sub.status) END;
 IF NOT paid AND sub.payment_confirmed_at IS NULL AND new_status IN ('active','trialing') THEN new_status:='pending'; END IF;
 IF new_status IN ('active','trialing') AND coalesce((_payload->>'periodEnd')::timestamptz,sub.current_period_end) IS NULL THEN RAISE EXCEPTION 'Período pago ausente'; END IF;
 UPDATE public.subscriptions SET status=new_status,price_id=new_price,current_period_start=coalesce((_payload->>'periodStart')::timestamptz,current_period_start),current_period_end=coalesce((_payload->>'periodEnd')::timestamptz,current_period_end),payment_confirmed_at=CASE WHEN paid THEN _occurred_at ELSE payment_confirmed_at END,first_failed_at=CASE WHEN paid THEN NULL WHEN new_status='past_due' THEN coalesce(first_failed_at,_occurred_at) ELSE first_failed_at END,cancel_at_period_end=coalesce((_payload->>'cancelAtPeriodEnd')::boolean,cancel_at_period_end),last_event_at=_occurred_at,updated_at=now() WHERE id=sub.id;
 IF paid THEN UPDATE public.subscription_checkouts SET status='completed' WHERE organization_id=sub.organization_id AND environment=_environment AND gateway_session_id=_payload->>'sessionId'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.process_subscription_payment(text,text,timestamptz,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.process_subscription_payment(text,text,timestamptz,text,jsonb) TO service_role;