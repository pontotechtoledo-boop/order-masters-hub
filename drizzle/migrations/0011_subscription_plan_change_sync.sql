CREATE OR REPLACE FUNCTION public.process_subscription_payment(_event_id text, _environment text, _occurred_at timestamp with time zone, _event_type text, _payload jsonb)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE intent public.subscription_checkouts; sub public.subscriptions; sub_id text; price text; new_price text; confirmed boolean; stored_status text; period_start timestamptz; period_end timestamptz;
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
 new_price := _payload->'items'->0->'price'->'importMeta'->>'externalId';
 IF _event_type NOT LIKE 'subscription.%' OR new_price NOT IN ('pontotech_monthly','pontotech_quarterly','pontotech_yearly') THEN new_price := sub.price_id; END IF;
 confirmed := sub.payment_confirmed_at IS NOT NULL OR _event_type='transaction.completed';
 stored_status := CASE WHEN _event_type='transaction.completed' THEN 'active' WHEN _event_type='transaction.payment_failed' THEN 'past_due' WHEN _event_type='subscription.canceled' THEN 'canceled' ELSE coalesce(_payload->>'status',sub.status) END;
 IF NOT confirmed AND stored_status IN ('active','trialing') THEN stored_status := 'pending'; END IF;
 period_start := coalesce((_payload->'currentBillingPeriod'->>'startsAt')::timestamptz,(_payload->'billingPeriod'->>'startsAt')::timestamptz,sub.current_period_start);
 period_end := coalesce((_payload->'currentBillingPeriod'->>'endsAt')::timestamptz,(_payload->'billingPeriod'->>'endsAt')::timestamptz,sub.current_period_end);
 UPDATE public.subscriptions SET status=stored_status, price_id=coalesce(new_price,price_id), current_period_start=period_start,current_period_end=period_end, payment_confirmed_at=CASE WHEN _event_type='transaction.completed' THEN _occurred_at ELSE payment_confirmed_at END, first_failed_at=CASE WHEN stored_status='past_due' THEN coalesce(first_failed_at,_occurred_at) WHEN _event_type='transaction.completed' THEN NULL ELSE first_failed_at END, cancel_at_period_end=CASE WHEN _event_type LIKE 'subscription.%' THEN coalesce(_payload->'scheduledChange'->>'action'='cancel',false) ELSE cancel_at_period_end END, last_event_at=_occurred_at,updated_at=now() WHERE id=sub.id;
 IF _event_type='transaction.completed' THEN UPDATE public.subscription_checkouts SET status='completed' WHERE organization_id=sub.organization_id AND environment=_environment AND paddle_transaction_id=_payload->>'id'; END IF;
END $function$;