-- Structured service-order diagnosis and terms.
ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS apparent_issue text,
  ADD COLUMN IF NOT EXISTS terms text;
