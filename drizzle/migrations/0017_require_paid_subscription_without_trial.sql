CREATE OR REPLACE FUNCTION public.organization_has_write_access(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce((SELECT public.subscription_allows_write(s.status,s.current_period_end,s.first_failed_at,now()) FROM public.subscriptions s WHERE s.organization_id=_org AND s.environment='live' ORDER BY s.created_at DESC,s.id DESC LIMIT 1),false);
$$;
REVOKE ALL ON FUNCTION public.organization_has_write_access(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.organization_has_write_access(uuid) TO authenticated,service_role;