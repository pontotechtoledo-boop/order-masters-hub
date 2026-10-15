-- service_orders.total is a generated column (subtotal - discount); only subtotal may be updated.
CREATE OR REPLACE FUNCTION public.consume_inventory_item(_order_id uuid, _inventory_item_id uuid, _quantity numeric, _unit_price numeric, _warranty_days integer DEFAULT 90)
 RETURNS service_order_items
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
DECLARE
  _order public.service_orders;
  _item public.inventory_items;
  _order_item public.service_order_items;
  _user_id uuid;
BEGIN
  IF _quantity <= 0 OR _unit_price < 0 OR _warranty_days < 0 THEN
    RAISE EXCEPTION 'Quantidade, preço ou garantia inválidos';
  END IF;
  SELECT * INTO _order FROM public.service_orders WHERE id = _order_id;
  IF NOT FOUND OR NOT private.is_org_member(_order.organization_id) THEN
    RAISE EXCEPTION 'Ordem não encontrada';
  END IF;
  SELECT * INTO _item FROM public.inventory_items
  WHERE id = _inventory_item_id AND organization_id = _order.organization_id AND active = true
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Peça não encontrada nesta empresa'; END IF;
  IF _item.quantity < _quantity THEN RAISE EXCEPTION 'Estoque insuficiente para esta ordem'; END IF;

  UPDATE public.inventory_items SET quantity = quantity - _quantity WHERE id = _item.id;

  INSERT INTO public.service_order_items (
    organization_id, order_id, inventory_item_id, item_type, description,
    quantity, unit_price, cost, warranty_days
  ) VALUES (
    _order.organization_id, _order.id, _item.id, 'part', _item.name,
    _quantity, _unit_price, _item.cost, _warranty_days
  ) RETURNING * INTO _order_item;

  SELECT p.id INTO _user_id FROM public.profiles p WHERE p.id = auth.uid();
  INSERT INTO public.inventory_movements (
    organization_id, inventory_item_id, order_id, movement_type,
    quantity, unit_cost, notes, created_by
  ) VALUES (
    _order.organization_id, _item.id, _order.id, 'order_consumption',
    _quantity, _item.cost, 'Consumo na OS-' || _order.order_number::text, _user_id
  );

  UPDATE public.service_orders
  SET subtotal = subtotal + (_quantity * _unit_price)
  WHERE id = _order.id;

  INSERT INTO public.order_events (
    organization_id, order_id, user_id, event_type, description, metadata
  ) VALUES (
    _order.organization_id, _order.id, _user_id, 'inventory_consumption',
    _quantity::text || 'x ' || _item.name || ' consumida do estoque',
    jsonb_build_object('inventory_item_id', _item.id, 'quantity', _quantity)
  );
  RETURN _order_item;
END;
$function$;

NOTIFY pgrst, 'reload schema';