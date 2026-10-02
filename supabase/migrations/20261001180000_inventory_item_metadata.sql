-- Metadados estruturados para peças e produtos, sem remover dados existentes.
ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS part_type text,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS quality text;

CREATE INDEX IF NOT EXISTS inventory_items_org_item_type_idx
  ON public.inventory_items (organization_id, item_type);

CREATE INDEX IF NOT EXISTS inventory_items_org_brand_model_idx
  ON public.inventory_items (organization_id, brand, model);
