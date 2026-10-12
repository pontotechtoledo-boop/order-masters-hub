-- Reconcile the two sales schema variants used by earlier project migrations.
-- Additive changes only: preserve existing sales, financial entries, and inventory.
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'completed';

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS service_order_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sales_service_order_id_fkey'
      AND conrelid = 'public.sales'::regclass
  ) THEN
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_service_order_id_fkey
      FOREIGN KEY (service_order_id) REFERENCES public.service_orders(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS sales_org_service_order_unique
  ON public.sales (organization_id, service_order_id)
  WHERE service_order_id IS NOT NULL;

ALTER TABLE public.financial_entries
  ADD COLUMN IF NOT EXISTS sale_id uuid,
  ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT 'assistance',
  ADD COLUMN IF NOT EXISTS entry_date timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS notes text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'financial_entries_sale_id_fkey'
      AND conrelid = 'public.financial_entries'::regclass
  ) THEN
    ALTER TABLE public.financial_entries
      ADD CONSTRAINT financial_entries_sale_id_fkey
      FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS financial_entries_sale_idx
  ON public.financial_entries (organization_id, sale_id);

CREATE OR REPLACE FUNCTION public.sync_sale_income(
  _organization_id uuid,
  _sale_id uuid,
  _department text,
  _amount numeric,
  _payment_method text,
  _description text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.financial_entries
  WHERE organization_id = _organization_id
    AND sale_id = _sale_id
    AND entry_type = 'income';

  IF coalesce(_amount, 0) > 0 THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='financial_entries' AND column_name='status'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='financial_entries' AND column_name='paid_at'
    ) THEN
      EXECUTE $sql$
        INSERT INTO public.financial_entries
          (organization_id, sale_id, entry_type, status, paid_at, department,
           category, description, amount, payment_method, created_by)
        VALUES ($1, $2, 'income', 'paid', now(), $3, 'Venda', $4, $5, $6, auth.uid())
      $sql$
      USING _organization_id, _sale_id, _department, _description, _amount, _payment_method;
    ELSE
      INSERT INTO public.financial_entries
        (organization_id, sale_id, entry_type, department, category,
         description, amount, payment_method, created_by)
      VALUES
        (_organization_id, _sale_id, 'income', _department, 'Venda',
         _description, _amount, _payment_method, auth.uid());
    END IF;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_sale_income(uuid,uuid,text,numeric,text,text) FROM PUBLIC, anon, authenticated;

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

  IF _expires_at < _starts_at THEN
    RAISE EXCEPTION 'A validade da garantia não pode terminar antes do início';
  END IF;

  SELECT * INTO v_order
  FROM public.service_orders
  WHERE id = _order_id AND organization_id = _organization_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ordem de serviço não encontrada nesta empresa';
  END IF;

  INSERT INTO public.warranties
    (organization_id, order_id, starts_at, expires_at, coverage, terms, status)
  VALUES
    (_organization_id, _order_id, _starts_at, _expires_at, _coverage, _terms, 'active')
  RETURNING * INTO v_warranty;

  UPDATE public.service_orders
  SET status = 'completed',
      delivered_at = now(),
      completed_at = coalesce(completed_at, now())
  WHERE id = _order_id AND organization_id = _organization_id;

  v_amount := greatest(coalesce(v_order.total, v_order.subtotal - coalesce(v_order.discount,0), 0), 0);
  v_notes := 'Receita automática da OS-' || v_order.order_number::text ||
    ' após emissão da garantia ' || coalesce(v_warranty.code,'') || '.';

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
  ELSIF v_amount > 0 THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='sales' AND column_name='sale_type'
    ) THEN
      EXECUTE $sql$
        INSERT INTO public.sales
          (organization_id, sale_type, department, customer_id, subtotal, discount,
           total, payment_method, notes, created_by, service_order_id)
        VALUES ($1, 'quick', 'assistance', $2, $3, 0, $3, 'other', $4, auth.uid(), $5)
        RETURNING *
      $sql$
      INTO v_sale
      USING _organization_id, v_order.customer_id, v_amount, v_notes, _order_id;
    ELSE
      EXECUTE $sql$
        INSERT INTO public.sales
          (organization_id, type, department, customer_id, subtotal, discount,
           total, payment_method, notes, created_by, service_order_id)
        VALUES ($1, 'quick', 'assistance', $2, $3, 0, $3, 'other', $4, auth.uid(), $5)
        RETURNING *
      $sql$
      INTO v_sale
      USING _organization_id, v_order.customer_id, v_amount, v_notes, _order_id;
    END IF;
  END IF;

  IF v_sale.id IS NOT NULL THEN
    PERFORM public.sync_sale_income(
      _organization_id, v_sale.id, 'assistance', v_amount, v_sale.payment_method, v_notes
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
  IF _total IS NULL OR _total < 0 THEN
    RAISE EXCEPTION 'Valor da venda inválido';
  END IF;
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

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada ou acesso não autorizado';
  END IF;

  UPDATE public.sales
  SET subtotal = _total + coalesce(discount,0),
      total = _total,
      payment_method = _payment_method,
      notes = _notes
  WHERE id = _sale_id
  RETURNING * INTO v_sale;

  PERFORM public.sync_sale_income(
    v_sale.organization_id, v_sale.id, v_sale.department, _total,
    _payment_method, coalesce(nullif(_notes,''),'Venda editada no sistema')
  );
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
  v_sale_label text;
BEGIN
  SELECT s.* INTO v_sale
  FROM public.sales s
  JOIN public.organization_members m
    ON m.organization_id = s.organization_id
   AND m.user_id = auth.uid()
   AND m.active = true
  WHERE s.id = _sale_id
  FOR UPDATE OF s;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada ou acesso não autorizado';
  END IF;

  v_sale_label := coalesce(to_jsonb(v_sale)->>'number', to_jsonb(v_sale)->>'sale_number', _sale_id::text);

  FOR v_item IN
    SELECT inventory_item_id, quantity, description
    FROM public.sale_items
    WHERE sale_id = _sale_id
      AND organization_id = v_sale.organization_id
      AND inventory_item_id IS NOT NULL
  LOOP
    UPDATE public.inventory_items
    SET quantity = quantity + v_item.quantity, updated_at = now()
    WHERE id = v_item.inventory_item_id
      AND organization_id = v_sale.organization_id;

    INSERT INTO public.inventory_movements
      (organization_id, inventory_item_id, movement_type, quantity, unit_cost, notes, created_by)
    SELECT v_sale.organization_id, i.id, 'entry', v_item.quantity,
           coalesce(i.cost,0), 'Estorno da venda #' || v_sale_label || ' — ' || coalesce(v_item.description,'item'),
           auth.uid()
    FROM public.inventory_items i
    WHERE i.id = v_item.inventory_item_id
      AND i.organization_id = v_sale.organization_id;
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

GRANT EXECUTE ON FUNCTION public.issue_service_order_warranty(uuid,uuid,date,date,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_sale_record(uuid,numeric,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_sale_record(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
