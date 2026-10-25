CREATE OR REPLACE FUNCTION public.process_hotmart_event(_event_id text, _event text, _occurred_at timestamptz, _email text, _subscriber_code text, _price_id text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_user uuid; v_org uuid; sub public.subscriptions; v_days int; v_base timestamptz; v_name text;
BEGIN
  INSERT INTO public.subscription_payment_events(event_id,environment,occurred_at) VALUES('hotmart:'||_event_id,'live',_occurred_at) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN 'duplicate'; END IF;
  IF _subscriber_code IS NULL OR length(_subscriber_code)=0 THEN RETURN 'no_subscriber'; END IF;
  SELECT * INTO sub FROM public.subscriptions WHERE gateway_subscription_id='hotmart:'||_subscriber_code AND environment='live' FOR UPDATE;
  IF sub.id IS NULL THEN
    IF _event NOT IN ('PURCHASE_APPROVED','PURCHASE_COMPLETE') THEN RETURN 'unknown_subscription'; END IF;
    SELECT id, coalesce(nullif(trim(raw_user_meta_data->>'full_name'),''), split_part(email,'@',1)) INTO v_user, v_name
      FROM auth.users WHERE lower(email)=lower(_email) LIMIT 1;
    IF v_user IS NULL THEN
      -- allow reprocessing after the account is created
      DELETE FROM public.subscription_payment_events WHERE event_id='hotmart:'||_event_id;
      RETURN 'user_not_found';
    END IF;
    SELECT organization_id INTO v_org FROM public.organization_members WHERE user_id=v_user AND active AND role IN ('owner','admin') ORDER BY created_at LIMIT 1;
    IF v_org IS NULL THEN
      INSERT INTO public.profiles(id, full_name) VALUES (v_user, v_name) ON CONFLICT (id) DO NOTHING;
      INSERT INTO public.organizations(name, email) VALUES (v_name, lower(_email)) RETURNING id INTO v_org;
      INSERT INTO public.organization_members(organization_id, user_id, role, active) VALUES (v_org, v_user, 'owner', true)
        ON CONFLICT (organization_id, user_id) DO UPDATE SET active = true;
    END IF;
    -- Same company buying again keeps its single subscription record.
    SELECT * INTO sub FROM public.subscriptions WHERE organization_id=v_org AND environment='live' ORDER BY updated_at DESC LIMIT 1 FOR UPDATE;
    IF sub.id IS NOT NULL THEN
      UPDATE public.subscriptions SET gateway_subscription_id='hotmart:'||_subscriber_code, gateway_customer_id='hotmart' WHERE id=sub.id RETURNING * INTO sub;
    ELSE
      INSERT INTO public.subscriptions(user_id,organization_id,gateway_subscription_id,gateway_customer_id,product_id,price_id,status,environment)
      VALUES(v_user,v_org,'hotmart:'||_subscriber_code,'hotmart',_price_id,_price_id,'pending','live')
      RETURNING * INTO sub;
    END IF;
  END IF;
  IF _event IN ('PURCHASE_APPROVED','PURCHASE_COMPLETE') THEN
    IF _price_id NOT IN ('pontotech_monthly','pontotech_quarterly','pontotech_yearly') THEN RETURN 'unknown_plan'; END IF;
    v_days := CASE _price_id WHEN 'pontotech_monthly' THEN 30 WHEN 'pontotech_quarterly' THEN 90 ELSE 365 END;
    v_base := greatest(coalesce(sub.current_period_end, now()), now());
    UPDATE public.subscriptions SET status='active', price_id=_price_id, product_id=_price_id,
      current_period_start=now(), current_period_end=v_base + make_interval(days=>v_days),
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

-- Active plans keep write access for 7 days after the paid period ends, then become read-only.
CREATE OR REPLACE FUNCTION public.enforce_organization_write_access()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org_id uuid; v_status text; v_trial_end timestamptz; v_sub_status text; v_period_end timestamptz;
BEGIN
  IF auth.role() = 'service_role' THEN RETURN COALESCE(NEW, OLD); END IF;
  IF TG_OP = 'DELETE' THEN v_org_id := OLD.organization_id; ELSE v_org_id := NEW.organization_id; END IF;
  SELECT o.subscription_status, o.trial_ends_at INTO v_status, v_trial_end FROM public.organizations o WHERE o.id = v_org_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Empresa não encontrada'; END IF;
  SELECT s.status, s.current_period_end INTO v_sub_status, v_period_end FROM public.subscriptions s
    WHERE s.organization_id = v_org_id AND s.environment = 'live' ORDER BY s.updated_at DESC LIMIT 1;
  IF v_status = 'active' AND (v_period_end IS NULL OR v_period_end + interval '7 days' > now()) THEN RETURN COALESCE(NEW, OLD); END IF;
  IF v_status = 'trial' AND (v_trial_end IS NULL OR v_trial_end > now()) THEN RETURN COALESCE(NEW, OLD); END IF;
  IF v_status IN ('past_due','grace_period') AND v_trial_end IS NOT NULL AND v_trial_end > now() THEN RETURN COALESCE(NEW, OLD); END IF;
  RAISE EXCEPTION 'Assinatura vencida. Renove o plano para cadastrar ou alterar informações. O histórico permanece disponível.';
END; $$;
REVOKE ALL ON FUNCTION public.enforce_organization_write_access() FROM PUBLIC, anon, authenticated;