ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER FUNCTION public.consume_inventory_item(uuid,uuid,numeric,numeric,integer) SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION public.consume_inventory_item(uuid,uuid,numeric,numeric,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_inventory_item(uuid,uuid,numeric,numeric,integer) TO authenticated;