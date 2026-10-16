CREATE OR REPLACE FUNCTION public.organization_has_write_access(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = _org AND o.trial_ends_at IS NOT NULL AND o.trial_ends_at > now())
  OR EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.organization_id = _org AND (
       (s.status IN ('active','trialing') AND (s.current_period_end IS NULL OR s.current_period_end > now()))
    OR (s.status = 'canceled' AND s.current_period_end > now())
    OR (s.status = 'past_due' AND s.first_failed_at IS NOT NULL AND s.first_failed_at + interval '7 days' > now())));
$$;
GRANT EXECUTE ON FUNCTION public.organization_has_write_access(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.enforce_organization_write_access()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid;
BEGIN
  IF auth.role() = 'service_role' OR current_user IN ('postgres','supabase_admin') AND auth.uid() IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF TG_OP = 'DELETE' THEN v_org := OLD.organization_id; ELSE v_org := NEW.organization_id; END IF;
  IF public.organization_has_write_access(v_org) THEN RETURN COALESCE(NEW, OLD); END IF;
  RAISE EXCEPTION 'Período de teste encerrado. Contrate um plano para cadastrar ou alterar informações. O histórico permanece disponível.';
END; $$;
REVOKE ALL ON FUNCTION public.enforce_organization_write_access() FROM PUBLIC, anon, authenticated;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['customers','devices','financial_entries','inventory_items','inventory_movements','order_photos','sale_items','sales','service_order_items','service_orders','warranties'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t||'_subscription_write_guard', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_write_access()', t||'_subscription_write_guard', t);
  END LOOP;
END $$;