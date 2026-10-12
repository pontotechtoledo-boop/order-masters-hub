-- Keep organization access in sync with Paddle subscription rows.
-- Enforce expired-trial read-only mode at the database layer; no existing records are removed.

CREATE OR REPLACE FUNCTION public.sync_organization_subscription_from_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_status text;
  v_plan text;
  v_period_end timestamptz;
  v_found boolean := false;
BEGIN
  v_org_id := COALESCE(NEW.organization_id, OLD.organization_id);

  SELECT s.status, s.product_id, s.current_period_end
    INTO v_status, v_plan, v_period_end
  FROM public.subscriptions s
  WHERE s.organization_id = v_org_id
    AND s.environment = 'live'
  ORDER BY s.updated_at DESC, s.created_at DESC
  LIMIT 1;

  v_found := FOUND;

  IF NOT v_found THEN
    UPDATE public.organizations
    SET subscription_status = CASE
          WHEN trial_ends_at IS NOT NULL AND trial_ends_at > now() THEN 'trial'
          ELSE 'expired'
        END
    WHERE id = v_org_id;
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE public.organizations
  SET subscription_status = CASE
        WHEN v_status IN ('active', 'trialing') THEN 'active'
        WHEN v_status = 'canceled' AND v_period_end IS NOT NULL AND v_period_end > now() THEN 'active'
        WHEN v_status = 'past_due' THEN 'past_due'
        WHEN v_status IN ('paused', 'canceled', 'inactive', 'unpaid') THEN 'expired'
        ELSE subscription_status
      END,
      plan = CASE
        WHEN v_plan IN ('pontotech_monthly', 'pontotech_quarterly', 'pontotech_yearly') THEN v_plan
        ELSE plan
      END
  WHERE id = v_org_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.sync_organization_subscription_from_row() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS subscriptions_sync_organization ON public.subscriptions;
CREATE TRIGGER subscriptions_sync_organization
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_organization_subscription_from_row();

-- A write is allowed only for an active paid subscription or an unexpired trial.
-- Service-role operations (including trusted payment webhooks) are allowed through.
CREATE OR REPLACE FUNCTION public.enforce_organization_write_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_status text;
  v_trial_end timestamptz;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_org_id := COALESCE(NEW.organization_id, OLD.organization_id);

  SELECT o.subscription_status, o.trial_ends_at
    INTO v_status, v_trial_end
  FROM public.organizations o
  WHERE o.id = v_org_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empresa não encontrada';
  END IF;

  IF v_status = 'active'
     OR (v_status = 'trial' AND (v_trial_end IS NULL OR v_trial_end > now()))
     OR (v_status IN ('past_due','grace_period') AND v_trial_end IS NOT NULL AND v_trial_end > now()) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  RAISE EXCEPTION 'Período de teste encerrado. Contrate um plano para cadastrar ou alterar informações. O histórico permanece disponível.';
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_organization_write_access() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS service_orders_subscription_write_guard ON public.service_orders;
CREATE TRIGGER service_orders_subscription_write_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.service_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_write_access();

DROP TRIGGER IF EXISTS sales_subscription_write_guard ON public.sales;
CREATE TRIGGER sales_subscription_write_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_write_access();

DROP TRIGGER IF EXISTS financial_entries_subscription_write_guard ON public.financial_entries;
CREATE TRIGGER financial_entries_subscription_write_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.financial_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_write_access();

DROP TRIGGER IF EXISTS inventory_items_subscription_write_guard ON public.inventory_items;
CREATE TRIGGER inventory_items_subscription_write_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_write_access();

DROP TRIGGER IF EXISTS inventory_movements_subscription_write_guard ON public.inventory_movements;
CREATE TRIGGER inventory_movements_subscription_write_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.inventory_movements
FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_write_access();

DROP TRIGGER IF EXISTS warranties_subscription_write_guard ON public.warranties;
CREATE TRIGGER warranties_subscription_write_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.warranties
FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_write_access();

NOTIFY pgrst, 'reload schema';
