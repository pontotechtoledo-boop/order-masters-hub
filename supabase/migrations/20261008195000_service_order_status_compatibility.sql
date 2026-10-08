-- Compatibilidade dos estados usados pela interface de ordens de serviço.
-- Apenas adiciona valores ao enum; não remove nem altera registros existentes.
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'completed';
