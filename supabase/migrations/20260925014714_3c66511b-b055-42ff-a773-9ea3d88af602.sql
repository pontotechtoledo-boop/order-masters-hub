ALTER TABLE public.service_order_items
  ADD COLUMN inventory_item_id uuid REFERENCES public.inventory_items(id) ON DELETE RESTRICT;

CREATE INDEX service_order_items_inventory_item_idx
  ON public.service_order_items(inventory_item_id)
  WHERE inventory_item_id IS NOT NULL;

CREATE INDEX inventory_movements_item_created_idx
  ON public.inventory_movements(inventory_item_id, created_at DESC);

ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_items_quantity_nonnegative CHECK (quantity >= 0),
  ADD CONSTRAINT inventory_items_minimum_nonnegative CHECK (minimum_quantity >= 0),
  ADD CONSTRAINT inventory_items_cost_nonnegative CHECK (cost >= 0),
  ADD CONSTRAINT inventory_items_price_nonnegative CHECK (price >= 0);

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
)
RETURNS public.inventory_items
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, private
AS $$
DECLARE
  _item public.inventory_items;
  _user_id uuid;
BEGIN
  IF NOT private.is_org_member(_organization_id) THEN
    RAISE EXCEPTION 'Acesso negado à empresa';
  END IF;
  IF coalesce(trim(_name), '') = '' THEN
    RAISE EXCEPTION 'Nome da peça é obrigatório';
  END IF;
  IF _quantity < 0 OR _minimum_quantity < 0 OR _cost < 0 OR _price < 0 THEN
    RAISE EXCEPTION 'Quantidades e valores não podem ser negativos';
  END IF;
  IF _branch_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.branches b WHERE b.id = _branch_id AND b.organization_id = _organization_id
  ) THEN
    RAISE EXCEPTION 'Filial inválida';
  END IF;

  INSERT INTO public.inventory_items (
    organization_id, branch_id, sku, name, category, supplier, location,
    quantity, minimum_quantity, cost, price
  ) VALUES (
    _organization_id, _branch_id, nullif(trim(_sku), ''), trim(_name),
    nullif(trim(_category), ''), nullif(trim(_supplier), ''), nullif(trim(_location), ''),
    _quantity, _minimum_quantity, _cost, _price
  ) RETURNING * INTO _item;

  SELECT p.id INTO _user_id FROM public.profiles p WHERE p.id = auth.uid();
  IF _quantity > 0 THEN
    INSERT INTO public.inventory_movements (
      organization_id, inventory_item_id, movement_type, quantity, unit_cost, notes, created_by
    ) VALUES (
      _organization_id, _item.id, 'entry', _quantity, _cost, 'Saldo inicial', _user_id
    );
  END IF;

  RETURN _item;
END;
$$;

CREATE OR REPLACE FUNCTION public.move_inventory(
  _inventory_item_id uuid,
  _movement_type text,
  _quantity numeric,
  _notes text DEFAULT NULL,
  _unit_cost numeric DEFAULT NULL
)
RETURNS public.inventory_items
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, private
AS $$
DECLARE
  _item public.inventory_items;
  _delta numeric;
  _user_id uuid;
BEGIN
  IF _movement_type NOT IN ('entry', 'exit', 'adjustment_add', 'adjustment_remove') THEN
    RAISE EXCEPTION 'Tipo de movimentação inválido';
  END IF;
  IF _quantity <= 0 THEN
    RAISE EXCEPTION 'A quantidade deve ser maior que zero';
  END IF;

  SELECT * INTO _item
  FROM public.inventory_items
  WHERE id = _inventory_item_id
  FOR UPDATE;

  IF NOT FOUND OR NOT private.is_org_member(_item.organization_id) THEN
    RAISE EXCEPTION 'Peça não encontrada';
  END IF;

  _delta := CASE WHEN _movement_type IN ('entry', 'adjustment_add') THEN _quantity ELSE -_quantity END;
  IF _item.quantity + _delta < 0 THEN
    RAISE EXCEPTION 'Estoque insuficiente';
  END IF;

  UPDATE public.inventory_items
  SET quantity = quantity + _delta
  WHERE id = _inventory_item_id
  RETURNING * INTO _item;

  SELECT p.id INTO _user_id FROM public.profiles p WHERE p.id = auth.uid();
  INSERT INTO public.inventory_movements (
    organization_id, inventory_item_id, movement_type, quantity, unit_cost, notes, created_by
  ) VALUES (
    _item.organization_id, _item.id, _movement_type, _quantity,
    coalesce(_unit_cost, _item.cost), nullif(trim(_notes), ''), _user_id
  );

  RETURN _item;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_inventory_item(
  _order_id uuid,
  _inventory_item_id uuid,
  _quantity numeric,
  _unit_price numeric,
  _warranty_days integer DEFAULT 90
)
RETURNS public.service_order_items
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, private
AS $$
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

  SELECT * INTO _item
  FROM public.inventory_items
  WHERE id = _inventory_item_id AND organization_id = _order.organization_id AND active = true
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Peça não encontrada nesta empresa';
  END IF;
  IF _item.quantity < _quantity THEN
    RAISE EXCEPTION 'Estoque insuficiente para esta ordem';
  END IF;

  UPDATE public.inventory_items
  SET quantity = quantity - _quantity
  WHERE id = _item.id;

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
  SET subtotal = subtotal + (_quantity * _unit_price),
      total = subtotal + (_quantity * _unit_price) - discount
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
$$;

REVOKE ALL ON FUNCTION public.create_inventory_item(uuid, uuid, text, text, text, text, text, numeric, numeric, numeric, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_inventory_item(uuid, uuid, text, text, text, text, text, numeric, numeric, numeric, numeric) TO authenticated;
REVOKE ALL ON FUNCTION public.move_inventory(uuid, text, numeric, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.move_inventory(uuid, text, numeric, text, numeric) TO authenticated;
REVOKE ALL ON FUNCTION public.consume_inventory_item(uuid, uuid, numeric, numeric, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_inventory_item(uuid, uuid, numeric, numeric, integer) TO authenticated;