ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS last_event_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS first_failed_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz;
CREATE TABLE public.subscription_checkouts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id), user_id uuid NOT NULL REFERENCES public.profiles(id), environment text NOT NULL CHECK (environment IN ('sandbox','live')), price_id text NOT NULL, paddle_transaction_id text UNIQUE, status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now() + interval '30 minutes'
);
GRANT SELECT ON public.subscription_checkouts TO authenticated;
GRANT ALL ON public.subscription_checkouts TO service_role;
ALTER TABLE public.subscription_checkouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY billing_manager_read ON public.subscription_checkouts FOR SELECT TO authenticated USING (private.has_org_role(organization_id, ARRAY['owner','admin']::public.app_role[]));
CREATE TABLE public.subscription_payment_events (event_id text PRIMARY KEY, environment text NOT NULL, occurred_at timestamptz NOT NULL, processed_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.subscription_payment_events TO service_role;
ALTER TABLE public.subscription_payment_events ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.reserve_subscription_checkout(_organization_id uuid, _user_id uuid, _environment text, _price_id text) RETURNS public.subscription_checkouts LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.subscription_checkouts;
BEGIN
 IF _environment NOT IN ('sandbox','live') OR _price_id NOT IN ('pontotech_monthly','pontotech_quarterly','pontotech_yearly') THEN RAISE EXCEPTION 'Plano inválido'; END IF;
 PERFORM 1 FROM public.organizations WHERE id=_organization_id FOR UPDATE;
 IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id=_organization_id AND user_id=_user_id AND active AND role IN ('owner','admin')) THEN RAISE EXCEPTION 'Sem permissão para contratar'; END IF;
 IF EXISTS (SELECT 1 FROM public.subscriptions WHERE organization_id=_organization_id AND environment=_environment AND (status IN ('active','trialing','past_due','paused','pending') OR (status='canceled' AND current_period_end>now()))) THEN RAISE EXCEPTION 'Sua empresa já possui assinatura. Gerencie a assinatura atual.'; END IF;
 SELECT * INTO r FROM public.subscription_checkouts WHERE organization_id=_organization_id AND environment=_environment AND status='pending' AND expires_at>now() ORDER BY created_at DESC LIMIT 1;
 IF r.id IS NOT NULL THEN
  IF r.price_id<>_price_id THEN RAISE EXCEPTION 'Já existe um pagamento em aberto para outro ciclo. Aguarde 30 minutos para escolher outro plano.'; END IF;
  IF r.paddle_transaction_id IS NULL THEN RAISE EXCEPTION 'Pagamento sendo preparado. Tente novamente em instantes.'; END IF;
  RETURN r;
 END IF;
 INSERT INTO public.subscription_checkouts(organization_id,user_id,environment,price_id) VALUES(_organization_id,_user_id,_environment,_price_id) RETURNING * INTO r;
 RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.reserve_subscription_checkout(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_subscription_checkout(uuid,uuid,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.process_subscription_payment(_event_id text, _environment text, _occurred_at timestamptz, _event_type text, _payload jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE intent public.subscription_checkouts; sub public.subscriptions; sub_id text; price text; confirmed boolean; stored_status text; period_start timestamptz; period_end timestamptz;
BEGIN
 IF _environment NOT IN ('sandbox','live') THEN RAISE EXCEPTION 'Ambiente inválido'; END IF;
 INSERT INTO public.subscription_payment_events(event_id,environment,occurred_at) VALUES(_event_id,_environment,_occurred_at) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN; END IF;
 IF _event_type NOT IN ('subscription.created','subscription.updated','subscription.canceled','transaction.completed','transaction.payment_failed') THEN RETURN; END IF;
 sub_id := CASE WHEN _event_type LIKE 'subscription.%' THEN _payload->>'id' ELSE _payload->>'subscriptionId' END;
 SELECT * INTO sub FROM public.subscriptions WHERE paddle_subscription_id=sub_id AND environment=_environment FOR UPDATE;
 IF sub.id IS NULL THEN
  SELECT * INTO intent FROM public.subscription_checkouts WHERE id::text=_payload->'customData'->>'checkoutId' AND environment=_environment FOR UPDATE;
  IF intent.id IS NULL THEN RAISE EXCEPTION 'Pagamento sem contratação autorizada'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.organization_members WHERE organization_id=intent.organization_id AND user_id=intent.user_id AND active AND role IN ('owner','admin')) THEN RAISE EXCEPTION 'Responsável pela contratação não autorizado'; END IF;
  IF _event_type LIKE 'transaction.%' AND intent.paddle_transaction_id IS DISTINCT FROM _payload->>'id' THEN RAISE EXCEPTION 'Transação não corresponde à contratação'; END IF;
  price := _payload->'items'->0->'price'->'importMeta'->>'externalId';
  IF price IS DISTINCT FROM intent.price_id THEN RAISE EXCEPTION 'Plano não corresponde à contratação'; END IF;
  IF _event_type='transaction.payment_failed' OR sub_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.subscriptions(user_id,organization_id,paddle_subscription_id,paddle_customer_id,product_id,price_id,status,environment) VALUES(intent.user_id,intent.organization_id,sub_id,_payload->>'customerId','pontotech_plan',intent.price_id,'pending',_environment) ON CONFLICT(paddle_subscription_id) DO NOTHING;
  SELECT * INTO sub FROM public.subscriptions WHERE paddle_subscription_id=sub_id AND environment=_environment FOR UPDATE;
 END IF;
 IF sub.last_event_at IS NOT NULL AND sub.last_event_at>_occurred_at THEN RETURN; END IF;
 confirmed := sub.payment_confirmed_at IS NOT NULL OR _event_type='transaction.completed';
 stored_status := CASE WHEN _event_type='transaction.completed' THEN 'active' WHEN _event_type='transaction.payment_failed' THEN 'past_due' WHEN _event_type='subscription.canceled' THEN 'canceled' ELSE coalesce(_payload->>'status',sub.status) END;
 IF NOT confirmed AND stored_status IN ('active','trialing') THEN stored_status := 'pending'; END IF;
 period_start := coalesce((_payload->'currentBillingPeriod'->>'startsAt')::timestamptz,(_payload->'billingPeriod'->>'startsAt')::timestamptz,sub.current_period_start);
 period_end := coalesce((_payload->'currentBillingPeriod'->>'endsAt')::timestamptz,(_payload->'billingPeriod'->>'endsAt')::timestamptz,sub.current_period_end);
 UPDATE public.subscriptions SET status=stored_status, current_period_start=period_start,current_period_end=period_end, payment_confirmed_at=CASE WHEN _event_type='transaction.completed' THEN _occurred_at ELSE payment_confirmed_at END, first_failed_at=CASE WHEN stored_status='past_due' THEN coalesce(first_failed_at,_occurred_at) WHEN _event_type='transaction.completed' THEN NULL ELSE first_failed_at END, cancel_at_period_end=CASE WHEN _event_type LIKE 'subscription.%' THEN coalesce(_payload->'scheduledChange'->>'action'='cancel',false) ELSE cancel_at_period_end END, last_event_at=_occurred_at,updated_at=now() WHERE id=sub.id;
 IF _event_type='transaction.completed' THEN UPDATE public.subscription_checkouts SET status='completed' WHERE organization_id=sub.organization_id AND environment=_environment AND paddle_transaction_id=_payload->>'id'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.process_subscription_payment(text,text,timestamptz,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.process_subscription_payment(text,text,timestamptz,text,jsonb) TO service_role;