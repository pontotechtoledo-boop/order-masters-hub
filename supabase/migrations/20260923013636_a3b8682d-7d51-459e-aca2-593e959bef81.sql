CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_org_member(_org uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.organization_members WHERE organization_id=_org AND user_id=auth.uid() AND active) $$;
CREATE OR REPLACE FUNCTION private.has_org_role(_org uuid, _roles public.app_role[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.organization_members WHERE organization_id=_org AND user_id=auth.uid() AND active AND role=ANY(_roles)) $$;
REVOKE ALL ON FUNCTION private.is_org_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_org_role(uuid,public.app_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_org_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_org_role(uuid,public.app_role[]) TO authenticated, service_role;

DROP POLICY organizations_member_read ON public.organizations; CREATE POLICY organizations_member_read ON public.organizations FOR SELECT TO authenticated USING (private.is_org_member(id));
DROP POLICY organizations_member_update ON public.organizations; CREATE POLICY organizations_member_update ON public.organizations FOR UPDATE TO authenticated USING (private.has_org_role(id,ARRAY['owner','admin']::public.app_role[]));
DROP POLICY members_org_read ON public.organization_members; CREATE POLICY members_org_read ON public.organization_members FOR SELECT TO authenticated USING (private.is_org_member(organization_id));
DROP POLICY members_org_manage ON public.organization_members; CREATE POLICY members_org_manage ON public.organization_members FOR ALL TO authenticated USING (private.has_org_role(organization_id,ARRAY['owner','admin']::public.app_role[])) WITH CHECK (private.has_org_role(organization_id,ARRAY['owner','admin']::public.app_role[]));
DROP POLICY branches_org ON public.branches; CREATE POLICY branches_org ON public.branches FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));
DROP POLICY customers_org ON public.customers; CREATE POLICY customers_org ON public.customers FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));
DROP POLICY devices_org ON public.devices; CREATE POLICY devices_org ON public.devices FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));
DROP POLICY orders_org ON public.service_orders; CREATE POLICY orders_org ON public.service_orders FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));
DROP POLICY order_items_org ON public.service_order_items; CREATE POLICY order_items_org ON public.service_order_items FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));
DROP POLICY order_events_read ON public.order_events; CREATE POLICY order_events_read ON public.order_events FOR SELECT TO authenticated USING (private.is_org_member(organization_id));
DROP POLICY order_events_add ON public.order_events; CREATE POLICY order_events_add ON public.order_events FOR INSERT TO authenticated WITH CHECK (private.is_org_member(organization_id));
DROP POLICY warranties_org ON public.warranties; CREATE POLICY warranties_org ON public.warranties FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));
DROP POLICY inventory_org ON public.inventory_items; CREATE POLICY inventory_org ON public.inventory_items FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));
DROP POLICY movements_read ON public.inventory_movements; CREATE POLICY movements_read ON public.inventory_movements FOR SELECT TO authenticated USING (private.is_org_member(organization_id));
DROP POLICY movements_add ON public.inventory_movements; CREATE POLICY movements_add ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (private.is_org_member(organization_id));
DROP POLICY financial_org ON public.financial_entries; CREATE POLICY financial_org ON public.financial_entries FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));

REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_org_role(uuid,public.app_role[]) FROM PUBLIC, anon, authenticated;
DROP FUNCTION public.is_org_member(uuid);
DROP FUNCTION public.has_org_role(uuid,public.app_role[]);