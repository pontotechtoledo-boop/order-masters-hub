-- Separate technical parts from store products and refresh the POS RPC schema cache.
ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'part';

ALTER TABLE public.inventory_items
  DROP CONSTRAINT IF EXISTS inventory_items_item_type_check;
ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_items_item_type_check CHECK (item_type IN ('part','store'));

-- Existing inventory is treated as technical parts by default. New store products
-- can be explicitly marked as store products by the application.

CREATE OR REPLACE FUNCTION public.create_pos_sale(
  _organization_id uuid,
  _sale_type text,
  _department text,
  _customer_id uuid,
  _discount numeric,
  _payment_method text,
  _notes text,
  _items jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _sale_id uuid;
  _subtotal numeric(12,2) := 0;
  _total numeric(12,2);
  _item jsonb;
  _inventory_id uuid;
  _qty numeric(12,3);
  _price numeric(12,2);
  _cost numeric(12,2);
  _name text;
  _stock public.inventory_items%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id=_organization_id AND m.user_id=auth.uid() AND m.active=true) THEN
    RAISE EXCEPTION 'Acesso não autorizado à empresa';
  END IF;
  IF _sale_type NOT IN ('pos','quick') OR _department NOT IN ('assistance','parts','store') THEN
    RAISE EXCEPTION 'Tipo de venda ou setor inválido';
  END IF;
  IF _payment_method NOT IN ('cash','pix','credit_card','debit_card','transfer','other') THEN
    RAISE EXCEPTION 'Forma de pagamento inválida';
  END IF;
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items)=0 THEN
    RAISE EXCEPTION 'Adicione ao menos um item à venda';
  END IF;

  FOR _item IN SELECT value FROM jsonb_array_elements(_items)
  LOOP
    _qty := (_item->>'quantity')::numeric;
    _price := (_item->>'unit_price')::numeric;
    IF _qty <= 0 OR _price < 0 THEN RAISE EXCEPTION 'Quantidade ou preço inválido'; END IF;
    _inventory_id := NULLIF(_item->>'inventory_item_id','')::uuid;
    IF _inventory_id IS NOT NULL THEN
      SELECT * INTO _stock FROM public.inventory_items
      WHERE id=_inventory_id AND organization_id=_organization_id AND active=true
      FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Item de estoque não encontrado nesta empresa'; END IF;
      IF _department='assistance' AND _stock.item_type <> 'part' THEN RAISE EXCEPTION 'Assistência técnica aceita somente peças técnicas'; END IF;
      IF _department IN ('parts') AND _stock.item_type <> 'part' THEN RAISE EXCEPTION 'A área de peças aceita somente peças técnicas'; END IF;
      IF _department='store' AND _stock.item_type <> 'store' THEN RAISE EXCEPTION 'Produtos da loja aceitam somente produtos da loja'; END IF;
      IF _stock.quantity < _qty THEN RAISE EXCEPTION 'Estoque insuficiente para: %', _stock.name; END IF;
      _name := _stock.name;
      _cost := coalesce(_stock.cost,0);
    ELSE
      _name := coalesce(nullif(_item->>'description',''),'Item avulso');
      _cost := coalesce((_item->>'unit_cost')::numeric,0);
    END IF;
    _subtotal := _subtotal + (_qty * _price);
  END LOOP;

  IF coalesce(_discount,0)<0 OR coalesce(_discount,0)>_subtotal THEN RAISE EXCEPTION 'Desconto inválido'; END IF;
  _total := _subtotal - coalesce(_discount,0);

  INSERT INTO public.sales (organization_id,sale_type,department,customer_id,subtotal,discount,total,payment_method,notes,created_by)
  VALUES (_organization_id,_sale_type,_department,_customer_id,_subtotal,coalesce(_discount,0),_total,_payment_method,_notes,auth.uid())
  RETURNING id INTO _sale_id;

  FOR _item IN SELECT value FROM jsonb_array_elements(_items)
  LOOP
    _qty := (_item->>'quantity')::numeric;
    _price := (_item->>'unit_price')::numeric;
    _inventory_id := NULLIF(_item->>'inventory_item_id','')::uuid;
    IF _inventory_id IS NOT NULL THEN
      SELECT * INTO _stock FROM public.inventory_items WHERE id=_inventory_id AND organization_id=_organization_id AND active=true FOR UPDATE;
      _name := _stock.name;
      _cost := coalesce(_stock.cost,0);
      UPDATE public.inventory_items SET quantity=quantity-_qty, updated_at=now() WHERE id=_inventory_id AND organization_id=_organization_id;
      INSERT INTO public.inventory_movements (organization_id,inventory_item_id,movement_type,quantity,unit_cost,notes,created_by)
      VALUES (_organization_id,_inventory_id,'exit',_qty,_cost,'Venda #'||_sale_id::text,auth.uid());
    ELSE
      _name := coalesce(nullif(_item->>'description',''),'Item avulso');
      _cost := coalesce((_item->>'unit_cost')::numeric,0);
    END IF;
    INSERT INTO public.sale_items (organization_id,sale_id,inventory_item_id,description,quantity,unit_price,unit_cost,line_total)
    VALUES (_organization_id,_sale_id,_inventory_id,_name,_qty,_price,_cost,_qty*_price);
  END LOOP;

  IF _total > 0 THEN
    INSERT INTO public.financial_entries (organization_id,sale_id,entry_type,department,category,description,amount,payment_method,created_by)
    VALUES (_organization_id,_sale_id,'income',_department,'Venda','Venda registrada no sistema',_total,_payment_method,auth.uid());
  END IF;
  RETURN _sale_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_pos_sale(uuid,text,text,uuid,numeric,text,text,jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';
