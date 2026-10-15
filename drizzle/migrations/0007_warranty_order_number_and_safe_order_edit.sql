ALTER TABLE public.warranties ADD COLUMN order_number bigint;
UPDATE public.warranties w SET order_number = o.order_number FROM public.service_orders o WHERE o.id = w.order_id AND o.organization_id = w.organization_id;
COMMENT ON COLUMN public.warranties.order_number IS 'Public warranty number, identical to the linked service order; code remains the unique internal authenticity identifier.';
CREATE OR REPLACE FUNCTION public.set_warranty_order_number() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 SELECT o.order_number INTO NEW.order_number FROM public.service_orders o WHERE o.id = NEW.order_id AND o.organization_id = NEW.organization_id;
 IF NEW.order_number IS NULL THEN RAISE EXCEPTION 'Ordem de serviço não encontrada nesta empresa'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER warranty_order_number BEFORE INSERT OR UPDATE ON public.warranties FOR EACH ROW EXECUTE FUNCTION public.set_warranty_order_number();
CREATE INDEX warranties_org_order_number_idx ON public.warranties (organization_id, order_number);
CREATE OR REPLACE FUNCTION public.edit_service_order(_order_id uuid, _changes jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.service_orders%ROWTYPE; s public.sales%ROWTYPE; new_total numeric; new_status public.order_status;
BEGIN
 SELECT so.* INTO o FROM public.service_orders so JOIN public.organization_members m ON m.organization_id=so.organization_id AND m.user_id=auth.uid() AND m.active WHERE so.id=_order_id FOR UPDATE OF so;
 IF NOT FOUND THEN RAISE EXCEPTION 'Ordem não encontrada ou acesso não autorizado'; END IF;
 new_total:=(_changes->>'total')::numeric;
 IF new_total IS NULL OR new_total<0 THEN RAISE EXCEPTION 'Valor da ordem inválido'; END IF;
 new_status:=(_changes->>'status')::public.order_status;
 UPDATE public.devices SET category=_changes->>'category',brand=_changes->>'brand',model=_changes->>'model',serial_number=nullif(_changes->>'serial','') WHERE id=o.device_id AND organization_id=o.organization_id;
 UPDATE public.service_orders SET reported_issue=_changes->>'issue', apparent_issue=nullif(_changes->>'apparent_issue',''), terms=nullif(_changes->>'terms',''), status=new_status, subtotal=new_total+discount, estimated_at=nullif(_changes->>'estimated_at','')::timestamptz, completed_at=CASE WHEN new_status='completed' THEN coalesce(completed_at,now()) ELSE completed_at END WHERE id=o.id RETURNING * INTO o;
 SELECT * INTO s FROM public.sales WHERE service_order_id=o.id AND organization_id=o.organization_id FOR UPDATE;
 IF FOUND THEN
 UPDATE public.sales SET subtotal=new_total+discount,total=new_total WHERE id=s.id;
 PERFORM public.sync_sale_income(o.organization_id,s.id,s.department,new_total,s.payment_method,coalesce(s.notes,'Receita da OS-'||o.order_number));
 END IF;
 RETURN to_jsonb(o);
END; $$;
REVOKE ALL ON FUNCTION public.edit_service_order(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.edit_service_order(uuid,jsonb) TO authenticated;
