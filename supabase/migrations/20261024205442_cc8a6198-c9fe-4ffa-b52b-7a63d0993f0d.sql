CREATE OR REPLACE FUNCTION public.process_hotmart_event(_event_id text, _event text, _occurred_at timestamptz, _email text, _subscriber_code text, _price_id text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_user uuid; v_org uuid; sub public.subscriptions; v_days int; v_base timestamptz;
BEGIN
  INSERT INTO public.subscription_payment_events(event_id,environment,occurred_at) VALUES('hotmart:'||_event_id,'live',_occurred_at) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN 'duplicate'; END IF;
  IF _subscriber_code IS NULL OR length(_subscriber_code)=0 THEN RETURN 'no_subscriber'; END IF;
  SELECT * INTO sub FROM public.subscriptions WHERE gateway_subscription_id='hotmart:'||_subscriber_code AND environment='live' FOR UPDATE;
  IF sub.id IS NULL THEN
    IF _event NOT IN ('PURCHASE_APPROVED','PURCHASE_COMPLETE') THEN RETURN 'unknown_subscription'; END IF;
    SELECT id INTO v_user FROM auth.users WHERE lower(email)=lower(_email) LIMIT 1;
    IF v_user IS NULL THEN RETURN 'user_not_found'; END IF;
    SELECT organization_id INTO v_org FROM public.organization_members WHERE user_id=v_user AND active AND role IN ('owner','admin') ORDER BY created_at LIMIT 1;
    IF v_org IS NULL THEN RETURN 'organization_not_found'; END IF;
    INSERT INTO public.subscriptions(user_id,organization_id,gateway_subscription_id,gateway_customer_id,product_id,price_id,status,environment)
    VALUES(v_user,v_org,'hotmart:'||_subscriber_code,'hotmart',_price_id,_price_id,'pending','live')
    RETURNING * INTO sub;
  END IF;
  IF _event IN ('PURCHASE_APPROVED','PURCHASE_COMPLETE') THEN
    IF _price_id NOT IN ('pontotech_monthly','pontotech_quarterly','pontotech_yearly') THEN RETURN 'unknown_plan'; END IF;
    v_days := CASE _price_id WHEN 'pontotech_monthly' THEN 30 WHEN 'pontotech_quarterly' THEN 90 ELSE 365 END;
    v_base := greatest(coalesce(sub.current_period_end, now()), now());
    UPDATE public.subscriptions SET status='active', price_id=_price_id, product_id=_price_id,
      current_period_start=coalesce(current_period_start, now()), current_period_end=v_base + make_interval(days=>v_days),
      payment_confirmed_at=_occurred_at, first_failed_at=NULL, cancel_at_period_end=false, last_event_at=_occurred_at, updated_at=now()
    WHERE id=sub.id;
  ELSIF _event='PURCHASE_DELAYED' THEN
    UPDATE public.subscriptions SET status='past_due', first_failed_at=coalesce(first_failed_at,_occurred_at), last_event_at=_occurred_at, updated_at=now() WHERE id=sub.id;
  ELSIF _event IN ('SUBSCRIPTION_CANCELLATION','PURCHASE_CANCELED') THEN
    UPDATE public.subscriptions SET status='canceled', cancel_at_period_end=true, last_event_at=_occurred_at, updated_at=now() WHERE id=sub.id;
  ELSIF _event IN ('PURCHASE_REFUNDED','PURCHASE_CHARGEBACK','PURCHASE_PROTEST') THEN
    UPDATE public.subscriptions SET status='canceled', cancel_at_period_end=true, current_period_end=now(), last_event_at=_occurred_at, updated_at=now() WHERE id=sub.id;
  ELSE RETURN 'ignored'; END IF;
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION public.process_hotmart_event(text,text,timestamptz,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_hotmart_event(text,text,timestamptz,text,text,text) TO service_role;