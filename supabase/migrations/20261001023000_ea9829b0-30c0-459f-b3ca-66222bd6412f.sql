ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'part' CHECK (item_type IN ('part','store'));
ALTER TABLE public.financial_entries ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT 'assistance';
ALTER TABLE public.financial_entries ADD COLUMN IF NOT EXISTS entry_date timestamptz NOT NULL DEFAULT now();

CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  number bigint GENERATED ALWAYS AS IDENTITY,
  type text NOT NULL CHECK (type IN ('pos','quick')),
  department text NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method text,
  notes text,
  created_by uuid,
  sold_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  inventory_item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales, public.sale_items TO authenticated;
GRANT ALL ON public.sales, public.sale_items TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members manage sales" ON public.sales FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));
CREATE POLICY "members manage sale items" ON public.sale_items FOR ALL TO authenticated USING (private.is_org_member(organization_id)) WITH CHECK (private.is_org_member(organization_id));

CREATE TABLE public.system_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_announcements TO authenticated;
GRANT ALL ON public.system_announcements TO service_role;
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read announcements" ON public.system_announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "platform admins manage announcements" ON public.system_announcements FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());

CREATE OR REPLACE FUNCTION public.is_platform_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private
AS $$ SELECT private.is_platform_admin() $$;
REVOKE EXECUTE ON FUNCTION public.is_platform_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_owner() TO authenticated;

CREATE OR REPLACE FUNCTION public.create_pos_sale(
  _organization_id uuid, _sale_type text, _department text, _customer_id uuid,
  _discount numeric, _payment_method text, _notes text, _items jsonb)
RETURNS public.sales LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private
AS $$
DECLARE _sale public.sales; _it jsonb; _sub numeric := 0; _inv uuid; _q numeric; _item public.inventory_items;
BEGIN
  IF NOT private.is_org_member(_organization_id) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF jsonb_array_length(coalesce(_items,'[]'::jsonb)) = 0 THEN RAISE EXCEPTION 'Adicione ao menos um item'; END IF;
  FOR _it IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _sub := _sub + (_it->>'quantity')::numeric * (_it->>'unit_price')::numeric;
  END LOOP;
  IF coalesce(_discount,0) < 0 OR coalesce(_discount,0) > _sub THEN RAISE EXCEPTION 'Desconto inválido'; END IF;
  INSERT INTO public.sales(organization_id,type,department,customer_id,subtotal,discount,total,payment_method,notes,created_by)
  VALUES (_organization_id,_sale_type,_department,_customer_id,_sub,coalesce(_discount,0),_sub-coalesce(_discount,0),_payment_method,_notes,auth.uid())
  RETURNING * INTO _sale;
  FOR _it IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _inv := nullif(_it->>'inventory_item_id','')::uuid; _q := (_it->>'quantity')::numeric;
    IF _inv IS NOT NULL THEN
      SELECT * INTO _item FROM public.inventory_items WHERE id=_inv AND organization_id=_organization_id FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Item não encontrado'; END IF;
      IF _item.quantity < _q THEN RAISE EXCEPTION 'Estoque insuficiente para %', _item.name; END IF;
      UPDATE public.inventory_items SET quantity = quantity - _q WHERE id=_inv;
      INSERT INTO public.inventory_movements(organization_id,inventory_item_id,movement_type,quantity,unit_cost,notes,created_by)
      VALUES (_organization_id,_inv,'exit',_q,_item.cost,'Venda #'||_sale.number,auth.uid());
    END IF;
    INSERT INTO public.sale_items(organization_id,sale_id,inventory_item_id,description,quantity,unit_price,unit_cost)
    VALUES (_organization_id,_sale.id,_inv,_it->>'description',_q,(_it->>'unit_price')::numeric,coalesce((_it->>'unit_cost')::numeric,0));
  END LOOP;
  INSERT INTO public.financial_entries(organization_id,entry_type,status,category,description,amount,paid_at,payment_method,department)
  VALUES (_organization_id,'income','paid','Venda','Venda #'||_sale.number,_sale.total,now(),_payment_method,_department);
  RETURN _sale;
END $$;
REVOKE EXECUTE ON FUNCTION public.create_pos_sale(uuid,text,text,uuid,numeric,text,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_pos_sale(uuid,text,text,uuid,numeric,text,text,jsonb) TO authenticated;