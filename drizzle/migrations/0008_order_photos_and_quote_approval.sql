CREATE TABLE public.order_photos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id), order_id uuid NOT NULL REFERENCES public.service_orders(id), storage_path text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, DELETE ON public.order_photos TO authenticated;
GRANT ALL ON public.order_photos TO service_role;
ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_photos_members ON public.order_photos FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id) AND EXISTS (SELECT 1 FROM public.service_orders o WHERE o.id=order_id AND o.organization_id=order_photos.organization_id) AND storage_path LIKE organization_id::text || '/' || order_id::text || '/%');
CREATE POLICY order_photo_storage_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='order-photos' AND EXISTS (SELECT 1 FROM public.service_orders o WHERE o.organization_id::text=(storage.foldername(name))[1] AND o.id::text=(storage.foldername(name))[2] AND public.is_org_member(o.organization_id)));
CREATE POLICY order_photo_storage_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='order-photos' AND EXISTS (SELECT 1 FROM public.service_orders o WHERE o.organization_id::text=(storage.foldername(name))[1] AND o.id::text=(storage.foldername(name))[2] AND public.is_org_member(o.organization_id)));
CREATE POLICY order_photo_storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='order-photos' AND EXISTS (SELECT 1 FROM public.service_orders o WHERE o.organization_id::text=(storage.foldername(name))[1] AND o.id::text=(storage.foldername(name))[2] AND public.is_org_member(o.organization_id)));
CREATE TABLE public.order_quotes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id), order_id uuid NOT NULL REFERENCES public.service_orders(id), token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32),'hex'), company_name text NOT NULL, order_number bigint NOT NULL, device text NOT NULL, description text NOT NULL, amount numeric NOT NULL CHECK (amount>=0), status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','revoked')), expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days', decided_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.order_quotes TO authenticated;
GRANT ALL ON public.order_quotes TO service_role;
ALTER TABLE public.order_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_quotes_members_read ON public.order_quotes FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE FUNCTION public.create_order_quote(_order_id uuid) RETURNS public.order_quotes LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.service_orders; q public.order_quotes; company text; equipment text;
BEGIN
 SELECT * INTO o FROM public.service_orders WHERE id=_order_id FOR UPDATE;
 IF NOT FOUND OR NOT public.is_org_member(o.organization_id) THEN RAISE EXCEPTION 'Ordem não encontrada'; END IF;
 IF o.status IN ('completed','delivered','cancelled','no_repair') THEN RAISE EXCEPTION 'Esta ordem já foi encerrada'; END IF;
 UPDATE public.order_quotes SET status='revoked' WHERE order_id=o.id AND status='pending';
 SELECT name INTO company FROM public.organizations WHERE id=o.organization_id;
 SELECT concat_ws(' ',brand,model) INTO equipment FROM public.devices WHERE id=o.device_id;
 INSERT INTO public.order_quotes(organization_id,order_id,company_name,order_number,device,description,amount) VALUES(o.organization_id,o.id,company,o.order_number,coalesce(equipment,''),coalesce(nullif(o.technical_report,''),nullif(o.diagnosis,''),o.reported_issue),coalesce(o.total,0)) RETURNING * INTO q;
 UPDATE public.service_orders SET status='awaiting_approval' WHERE id=o.id;
 RETURN q;
END; $$;
REVOKE ALL ON FUNCTION public.create_order_quote(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_order_quote(uuid) TO authenticated;
CREATE FUNCTION public.read_order_quote(_token text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE q public.order_quotes;
BEGIN
 IF _token IS NULL OR _token !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Link inválido'; END IF;
 SELECT * INTO q FROM public.order_quotes WHERE token=_token AND status<>'revoked';
 IF NOT FOUND THEN RAISE EXCEPTION 'Orçamento indisponível'; END IF;
 RETURN jsonb_build_object('company',q.company_name,'number',q.order_number,'device',q.device,'description',q.description,'amount',q.amount,'status',q.status,'expiresAt',q.expires_at,'decidedAt',q.decided_at);
END; $$;
CREATE FUNCTION public.decide_order_quote(_token text,_decision text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE q public.order_quotes; o public.service_orders;
BEGIN
 IF _token IS NULL OR _token !~ '^[a-f0-9]{64}$' OR _decision IS NULL OR _decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Resposta inválida'; END IF;
 SELECT * INTO q FROM public.order_quotes WHERE token=_token;
 IF NOT FOUND THEN RAISE EXCEPTION 'Orçamento indisponível'; END IF;
 SELECT * INTO o FROM public.service_orders WHERE id=q.order_id FOR UPDATE;
 SELECT * INTO q FROM public.order_quotes WHERE token=_token FOR UPDATE;
 IF q.status<>'pending' OR q.expires_at<=now() THEN RAISE EXCEPTION 'Este orçamento já foi respondido ou expirou'; END IF;
 IF o.status<>'awaiting_approval' OR coalesce(o.total,0)<>q.amount THEN RAISE EXCEPTION 'A ordem mudou. Solicite um novo orçamento'; END IF;
 UPDATE public.order_quotes SET status=_decision,decided_at=now() WHERE id=q.id;
 UPDATE public.service_orders SET status=CASE WHEN _decision='approved' THEN 'approved'::public.order_status ELSE 'quote'::public.order_status END WHERE id=o.id;
 INSERT INTO public.order_events(organization_id,order_id,event_type,description,metadata) VALUES(o.organization_id,o.id,'quote_decision',CASE WHEN _decision='approved' THEN 'Cliente aprovou o orçamento pelo link' ELSE 'Cliente recusou o orçamento pelo link' END,jsonb_build_object('quote_id',q.id,'amount',q.amount));
 RETURN public.read_order_quote(_token);
END; $$;
REVOKE ALL ON FUNCTION public.read_order_quote(text),public.decide_order_quote(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_order_quote(text),public.decide_order_quote(text,text) TO anon,authenticated;
