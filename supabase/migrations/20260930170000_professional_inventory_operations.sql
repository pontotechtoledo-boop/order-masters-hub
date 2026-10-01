-- Professional inventory operations for Service Pro Hub.
-- Keeps stock changes atomic for initial stock, manual movements and service-order consumption.

CREATE OR REPLACE FUNCTION public.create_inventory_item(
  _organization_id uuid,
  _branch_id uuid,
  _sku text,
  _name text,
  _category text,
  _supplier text,
  _location text,
  _quantity numeric,
  _minimum_quantity numeric,
  _cost numeric,
  _price numeric
) RETURNS public.inventory_items
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public
AS $$
DECLARE r public.inventory_items;
BEGIN
  IF NOT public.is_org_member(_organization_id) THEN RAISE EXCEPTION 'Acesso não autorizado à empresa'; END IF;
  IF coalesce(_name,'')='' THEN RAISE EXCEPTION 'Nome do item é obrigatório'; END IF;
  IF coalesce(_quantity,0)<0 OR coalesce(_minimum_quantity,0)<0 OR coalesce(_cost,0)<0 OR coalesce(_price,0)<0 THEN
    RAISE EXCEPTION 'Valores de estoque inválidos';
  END IF;
  INSERT INTO public.inventory_items(organization_id,branch_id,sku,name,category,supplier,location,quantity,minimum_quantity,cost,price)
  VALUES(_organization_id,_branch_id,NULLIF(trim(_sku),''),trim(_name),NULLIF(trim(_category),''),NULLIF(trim(_supplier),''),NULLIF(trim(_location),''),coalesce(_quantity,0),coalesce(_minimum_quantity,0),coalesce(_cost,0),coalesce(_price,0))
  RETURNING * INTO r;
  IF r.quantity>0 THEN
    INSERT INTO public.inventory_movements(organization_id,inventory_item_id,movement_type,quantity,unit_cost,notes,created_by)
    VALUES(r.organization_id,r.id,'entry',r.quantity,r.cost,'Saldo inicial',auth.uid());
  END IF;
  RETURN r;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_inventory_item(uuid,uuid,text,text,text,text,text,numeric,numeric,numeric,numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.move_inventory(
  _inventory_item_id uuid,
  _movement_type text,
  _quantity numeric,
  _notes text,
  _unit_cost numeric
) RETURNS public.inventory_items
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public
AS $$
DECLARE r public.inventory_items;
BEGIN
  SELECT * INTO r FROM public.inventory_items WHERE id=_inventory_item_id AND active=true FOR UPDATE;
  IF NOT FOUND OR NOT public.is_org_member(r.organization_id) THEN RAISE EXCEPTION 'Item de estoque não encontrado'; END IF;
  IF _movement_type NOT IN ('entry','exit') OR coalesce(_quantity,0)<=0 THEN RAISE EXCEPTION 'Movimentação inválida'; END IF;
  IF _movement_type='exit' AND r.quantity<_quantity THEN RAISE EXCEPTION 'Estoque insuficiente'; END IF;
  UPDATE public.inventory_items
    SET quantity=quantity + CASE WHEN _movement_type='entry' THEN _quantity ELSE -_quantity END,
        updated_at=now()
    WHERE id=r.id
    RETURNING * INTO r;
  INSERT INTO public.inventory_movements(organization_id,inventory_item_id,movement_type,quantity,unit_cost,notes,created_by)
  VALUES(r.organization_id,r.id,_movement_type,_quantity,coalesce(_unit_cost,r.cost),NULLIF(trim(_notes),''),auth.uid());
  RETURN r;
END;
$$;
GRANT EXECUTE ON FUNCTION public.move_inventory(uuid,text,numeric,text,numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.consume_inventory_item(
  _order_id uuid,
  _inventory_item_id uuid,
  _quantity numeric,
  _unit_price numeric,
  _warranty_days integer DEFAULT 90
) RETURNS public.inventory_items
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public
AS $$
DECLARE r public.inventory_items;
DECLARE o public.service_orders;
BEGIN
  SELECT * INTO o FROM public.service_orders WHERE id=_order_id FOR UPDATE;
  IF NOT FOUND OR NOT public.is_org_member(o.organization_id) THEN RAISE EXCEPTION 'Ordem não encontrada'; END IF;
  SELECT * INTO r FROM public.inventory_items WHERE id=_inventory_item_id AND active=true FOR UPDATE;
  IF NOT FOUND OR r.organization_id<>o.organization_id THEN RAISE EXCEPTION 'Peça não encontrada nesta empresa'; END IF;
  IF coalesce(_quantity,0)<=0 OR r.quantity<_quantity THEN RAISE EXCEPTION 'Estoque insuficiente para: %',r.name; END IF;
  UPDATE public.inventory_items SET quantity=quantity-_quantity,updated_at=now() WHERE id=r.id RETURNING * INTO r;
  INSERT INTO public.inventory_movements(organization_id,inventory_item_id,order_id,movement_type,quantity,unit_cost,notes,created_by)
  VALUES(r.organization_id,r.id,o.id,'exit',_quantity,r.cost,'Consumo na OS #'||o.order_number,auth.uid());
  INSERT INTO public.service_order_items(organization_id,order_id,item_type,description,quantity,unit_price,cost,warranty_days)
  VALUES(o.organization_id,o.id,'part',r.name,_quantity,coalesce(_unit_price,r.price),r.cost,coalesce(_warranty_days,90));
  UPDATE public.service_orders
    SET subtotal=subtotal + (_quantity*coalesce(_unit_price,r.price)), updated_at=now()
    WHERE id=o.id;
  RETURN r;
END;
$$;
GRANT EXECUTE ON FUNCTION public.consume_inventory_item(uuid,uuid,numeric,numeric,integer) TO authenticated;
