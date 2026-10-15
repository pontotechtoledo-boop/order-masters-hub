CREATE OR REPLACE FUNCTION public.prevent_duplicate_customer_document()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _doc text := regexp_replace(coalesce(NEW.document,''), '\D', '', 'g');
BEGIN
  IF _doc = '' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND regexp_replace(coalesce(OLD.document,''), '\D', '', 'g') = _doc THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM public.customers c WHERE c.organization_id = NEW.organization_id AND c.id <> NEW.id
             AND regexp_replace(coalesce(c.document,''), '\D', '', 'g') = _doc) THEN
    RAISE EXCEPTION 'Já existe um cliente cadastrado com este CPF/CNPJ.' USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS customers_unique_document ON public.customers;
CREATE TRIGGER customers_unique_document BEFORE INSERT OR UPDATE OF document ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_customer_document();