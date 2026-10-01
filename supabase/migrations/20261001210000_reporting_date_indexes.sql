-- Índices para consultas e relatórios por período, sem remover dados existentes.
CREATE INDEX IF NOT EXISTS service_orders_org_created_at_idx
  ON public.service_orders (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS warranties_org_created_at_idx
  ON public.warranties (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS financial_entries_org_entry_date_idx
  ON public.financial_entries (organization_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS sales_org_sold_at_idx
  ON public.sales (organization_id, sold_at DESC);
