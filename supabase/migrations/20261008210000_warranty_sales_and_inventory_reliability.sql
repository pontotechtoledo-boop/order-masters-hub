-- Reliable warranty finalization, automatic assistance revenue, sale maintenance and stock metadata.
-- Additive/idempotent changes only; no existing records are removed.

ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'completed';

ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'part',
  ADD COLUMN IF NOT EXISTS part_type text,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS quality text;

ALTER TABLE public.inventory_items
  DROP CONSTRAINT IF EXISTS inventory_items_item_type_check;
ALTER TABLE public.inventory_items
  ADD CONSTRAINT inventory_items_item_type_check
  CHECK (item_type IN ('part','store'));

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS service_order_id uuid
  REFERENCES public.service_orders(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS sales_org_service_order_unique
  ON public.sales (organization_id, service_order_id)
  WHERE service_order_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.update_inventory_item_metadata(
  _organization_id uuid,
  _inventory_item_id uuid,
  _item_type text,
  _part_type text,
  _brand text,
  _model text,
  _quality text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = _organization_id
      AND m.user_id = auth.uid()
      AND m.active = true
  ) THEN
    RAISE EXCEPTION 'Acesso não autorizado à empresa';
  END IF;
  IF _item_type NOT IN ('part','store') THEN
    RAISE EXCEPTION 'Tipo de item inválido';
  END IF;
  UPDATE public.inventory_items
  SET item_type = _item_type,
      part_type = NULLIF(_part_type,''),
      brand = NULLIF(_brand,''),
      model = NULLIF(_model,''),
      quality = NULLIF(_quality,''),
      updated_at = now()
  WHERE id = _inventory_item_id
    AND organization_id = _organization_id
    AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item de estoque não encontrado nesta empresa';
  END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.issue_service_order_warranty(
  _organization_id uuid,
  _order_id uuid,
  _starts_at date,
  _expires_at date,
  _coverage text,
  _terms text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.service_orders%ROWTYPE;
  v_warranty public.warranties%ROWTYPE;
  v_sale public.sales%ROWTYPE;
  v_amount numeric(12,2);
  v_notes text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = _organization_id
      AND m.user_id = auth.uid()
      AND m.active = true
  ) THEN
    RAISE EXCEPTION 'Acesso não autorizado à empresa';
  END IF;

  SELECT * INTO v_order
  FROM public.service_orders
  WHERE id = _order_id AND organization_id = _organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ordem de serviço não encontrada nesta empresa';
  END IF;

  INSERT INTO public.warranties (
    organization_id, order_id, starts_at, expires_at, coverage, terms, status
  ) VALUES (
    _organization_id, _order_id, _starts_at, _expires_at,
    _coverage, _terms, 'active'
  )
  RETURNING * INTO v_warranty;

  UPDATE public.service_orders
  SET status = 'completed',
      delivered_at = now()
  WHERE id = _order_id AND organization_id = _organization_id;

  v_amount := greatest(coalesce(v_order.total, v_order.subtotal - coalesce(v_order.discount,0), 0), 0);
  v_notes := 'Receita automática da OS-' || v_order.order_number::text || ' após emissão da garantia ' || coalesce(v_warranty.code,'') || '.';

  IF v_amount > 0 THEN
    SELECT * INTO v_sale
    FROM public.sales
    WHERE organization_id = _organization_id AND service_order_id = _order_id
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.sales
      SET subtotal = v_amount + coalesce(discount,0),
          total = v_amount,
          department = 'assistance',
          customer_id = v_order.customer_id,
          payment_method = 'other',
          notes = v_notes
      WHERE id = v_sale.id
      RETURNING * INTO v_sale;
    ELSE
      INSERT INTO public.sales (
        organization_id, sale_type, department, customer_id,
        subtotal, discount, total, payment_method, notes, created_by, service_order_id
      ) VALUES (
        _organization_id, 'quick', 'assistance', v_order.customer_id,
        v_amount, 0, v_amount, 'other', v_notes, auth.uid(), _order_id
      )
      RETURNING * INTO v_sale;
    END IF;

    DELETE FROM public.financial_entries
    WHERE organization_id = _organization_id AND sale_id = v_sale.id AND entry_type = 'income';

    INSERT INTO public.financial_entries (
      organization_id, sale_id, entry_type, department, category,
      description, amount, payment_method, created_by
    ) VALUES (
      _organization_id, v_sale.id, 'income', 'assistance', 'Assistência técnica',
      v_notes, v_amount, 'other', auth.uid()
    );
  END IF;

  RETURN jsonb_build_object(
    'warranty', to_jsonb(v_warranty),
    'sale', CASE WHEN v_sale.id IS NULL THEN NULL ELSE to_jsonb(v_sale) END,
    'order_id', _order_id,
    'order_status', 'completed',
    'sale_amount', v_amount
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_sale_record(
  _sale_id uuid,
  _total numeric,
  _payment_method text,
  _notes text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale public.sales%ROWTYPE;
BEGIN
  IF _total IS NULL OR _total < 0 THEN RAISE EXCEPTION 'Valor da venda inválido'; END IF;
  IF _payment_method NOT IN ('cash','pix','credit_card','debit_card','transfer','other') THEN
    RAISE EXCEPTION 'Forma de pagamento inválida';
  END IF;

  SELECT s.* INTO v_sale
  FROM public.sales s
  JOIN public.organization_members m
    ON m.organization_id = s.organization_id
   AND m.user_id = auth.uid()
   AND m.active = true
  WHERE s.id = _sale_id
  FOR UPDATE OF s;
  IF NOT FOUND THEN RAISE EXCEPTION 'Venda não encontrada ou acesso não autorizado'; END IF;

  UPDATE public.sales
  SET subtotal = _total + coalesce(discount,0),
      total = _total,
      payment_method = _payment_method,
      notes = _notes
  WHERE id = _sale_id;

  DELETE FROM public.financial_entries
  WHERE sale_id = _sale_id AND entry_type = 'income';

  IF _total > 0 THEN
    INSERT INTO public.financial_entries (
      organization_id, sale_id, entry_type, department, category,
      description, amount, payment_method, created_by
    ) VALUES (
      v_sale.organization_id, _sale_id, 'income', v_sale.department, 'Venda',
      coalesce(nullif(_notes,''),'Venda editada no sistema'), _total, _payment_method, auth.uid()
    );
  END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_sale_record(_sale_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale public.sales%ROWTYPE;
  v_item record;
BEGIN
  SELECT s.* INTO v_sale
  FROM public.sales s
  JOIN public.organization_members m
    ON m.organization_id = s.organization_id
   AND m.user_id = auth.uid()
   AND m.active = true
  WHERE s.id = _sale_id
  FOR UPDATE OF s;
  IF NOT FOUND THEN RAISE EXCEPTION 'Venda não encontrada ou acesso não autorizado'; END IF;

  FOR v_item IN
    SELECT inventory_item_id, quantity, description
    FROM public.sale_items
    WHERE sale_id = _sale_id AND organization_id = v_sale.organization_id
      AND inventory_item_id IS NOT NULL
  LOOP
    UPDATE public.inventory_items
    SET quantity = quantity + v_item.quantity, updated_at = now()
    WHERE id = v_item.inventory_item_id AND organization_id = v_sale.organization_id;

    INSERT INTO public.inventory_movements (
      organization_id, inventory_item_id, movement_type, quantity,
      unit_cost, notes, created_by
    )
    SELECT v_sale.organization_id, i.id, 'entry', v_item.quantity,
           coalesce(i.cost,0), 'Estorno da venda #' || v_sale.sale_number::text || ' — ' || coalesce(v_item.description,'item'),
           auth.uid()
    FROM public.inventory_items i
    WHERE i.id = v_item.inventory_item_id AND i.organization_id = v_sale.organization_id;
  END LOOP;

  DELETE FROM public.financial_entries
  WHERE organization_id = v_sale.organization_id AND sale_id = _sale_id;
  DELETE FROM public.sale_items
  WHERE organization_id = v_sale.organization_id AND sale_id = _sale_id;
  DELETE FROM public.sales
  WHERE id = _sale_id AND organization_id = v_sale.organization_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_inventory_item_metadata(uuid,uuid,text,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_service_order_warranty(uuid,uuid,date,date,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_sale_record(uuid,numeric,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_sale_record(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
