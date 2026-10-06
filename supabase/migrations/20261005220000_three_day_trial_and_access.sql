-- Plano comercial: período de teste gratuito de 3 dias.
-- Não altera dados existentes nem remove registros.
ALTER TABLE public.organizations
  ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '3 days');

CREATE OR REPLACE FUNCTION public.get_subscription_access(_organization_id uuid)
RETURNS TABLE (
  allowed boolean,
  status text,
  plan text,
  trial_ends_at timestamptz,
  read_only boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN o.subscription_status = 'active' THEN true
      WHEN o.subscription_status = 'trial' AND (o.trial_ends_at IS NULL OR o.trial_ends_at > now()) THEN true
      WHEN o.subscription_status IN ('past_due','grace_period') AND (o.trial_ends_at IS NULL OR o.trial_ends_at > now()) THEN true
      ELSE false
    END AS allowed,
    o.subscription_status AS status,
    o.plan,
    o.trial_ends_at,
    CASE
      WHEN o.subscription_status = 'active' THEN false
      WHEN o.subscription_status = 'trial' AND (o.trial_ends_at IS NULL OR o.trial_ends_at > now()) THEN false
      WHEN o.subscription_status IN ('past_due','grace_period') AND (o.trial_ends_at IS NULL OR o.trial_ends_at > now()) THEN false
      ELSE true
    END AS read_only
  FROM public.organizations o
  WHERE o.id = _organization_id
    AND public.is_org_member(o.id);
$$;

REVOKE ALL ON FUNCTION public.get_subscription_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_subscription_access(uuid) TO authenticated;

CREATE INDEX IF NOT EXISTS organizations_subscription_status_idx
  ON public.organizations(subscription_status, trial_ends_at);
