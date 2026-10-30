CREATE OR REPLACE FUNCTION public.subscription_allows_write(_status text, _period_end timestamptz, _first_failed_at timestamptz, _now timestamptz)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT coalesce(CASE
 WHEN _status IN ('active','trialing') THEN _period_end IS NULL OR _period_end + interval '7 days' > _now
 WHEN _status = 'canceled' THEN _period_end > _now
 WHEN _status = 'past_due' THEN _first_failed_at + interval '7 days' > _now
 ELSE false END, false);
$$;
REVOKE ALL ON FUNCTION public.subscription_allows_write(text,timestamptz,timestamptz,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.subscription_allows_write(text,timestamptz,timestamptz,timestamptz) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.organization_has_write_access(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT coalesce((SELECT public.subscription_allows_write(s.status,s.current_period_end,s.first_failed_at,now())
 FROM public.subscriptions s WHERE s.organization_id=_org AND s.environment='live'
 ORDER BY s.created_at DESC, s.id DESC LIMIT 1),
 EXISTS(SELECT 1 FROM public.organizations o WHERE o.id=_org AND o.trial_ends_at IS NOT NULL AND o.trial_ends_at > now()));
$$;
REVOKE ALL ON FUNCTION public.organization_has_write_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.organization_has_write_access(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.enforce_organization_write_access()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid;
BEGIN
 IF auth.role()='service_role' THEN RETURN COALESCE(NEW,OLD); END IF;
 IF TG_OP='DELETE' THEN v_org:=OLD.organization_id; ELSE v_org:=NEW.organization_id; END IF;
 IF public.organization_has_write_access(v_org) THEN RETURN COALESCE(NEW,OLD); END IF;
 RAISE EXCEPTION 'Assinatura vencida. Renove o plano para cadastrar ou alterar informações. O histórico permanece disponível.';
END; $$;
REVOKE ALL ON FUNCTION public.enforce_organization_write_access() FROM PUBLIC, anon, authenticated;
