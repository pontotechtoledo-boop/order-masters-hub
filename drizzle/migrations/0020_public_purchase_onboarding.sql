CREATE TABLE public.public_subscription_purchases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL, full_name text NOT NULL, company_name text NOT NULL, document text NOT NULL,
 environment text NOT NULL CHECK(environment IN ('sandbox','live')), price_id text NOT NULL CHECK(price_id IN ('pontotech_monthly','pontotech_quarterly','pontotech_yearly')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','revoked','activated')), gateway_session_id text UNIQUE,
 browser_token_hash text NOT NULL, activation_token_hash text, invite_token_hash text, user_id uuid, organization_id uuid,
 paid_payload jsonb, paid_at timestamptz, last_event_at timestamptz, provisioning_until timestamptz, activated_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '30 minutes'
);
GRANT ALL ON public.public_subscription_purchases TO service_role;
ALTER TABLE public.public_subscription_purchases ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX public_purchase_open_email ON public.public_subscription_purchases(lower(email),environment) WHERE status='pending';
CREATE OR REPLACE FUNCTION public.registration_email_exists(_email text) RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=public,auth AS $$ SELECT EXISTS(SELECT 1 FROM auth.users WHERE lower(email)=lower(trim(_email))); $$;
REVOKE ALL ON FUNCTION public.registration_email_exists(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.registration_email_exists(text) TO service_role;
CREATE OR REPLACE FUNCTION public.record_public_purchase_payment(_id uuid,_session_id text,_price_id text,_environment text,_payload jsonb,_paid_at timestamptz) RETURNS public.public_subscription_purchases LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.public_subscription_purchases;
BEGIN
 SELECT * INTO r FROM public.public_subscription_purchases WHERE id=_id FOR UPDATE;
 IF r.id IS NULL OR r.gateway_session_id IS DISTINCT FROM _session_id OR r.environment<>_environment OR r.price_id<>_price_id THEN RAISE EXCEPTION 'Contratação inválida'; END IF;
 IF r.status='revoked' OR (r.last_event_at>_paid_at AND coalesce((_payload->>'periodEnd')::timestamptz,'-infinity')<coalesce((r.paid_payload->>'periodEnd')::timestamptz,'infinity')) THEN RETURN r; END IF;
 UPDATE public.public_subscription_purchases SET status=CASE WHEN activated_at IS NULL THEN 'paid' ELSE 'activated' END,paid_payload=_payload,paid_at=coalesce(paid_at,_paid_at),last_event_at=greatest(last_event_at,_paid_at) WHERE id=_id RETURNING * INTO r;
 RETURN r;
END; $$;
REVOKE ALL ON FUNCTION public.record_public_purchase_payment(uuid,text,text,text,jsonb,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_public_purchase_payment(uuid,text,text,text,jsonb,timestamptz) TO service_role;
CREATE OR REPLACE FUNCTION public.claim_public_purchase_provisioning(_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 UPDATE public.public_subscription_purchases SET provisioning_until=now()+interval '2 minutes' WHERE id=_id AND status='paid' AND user_id IS NULL AND (provisioning_until IS NULL OR provisioning_until<now()); RETURN FOUND;
END; $$;
REVOKE ALL ON FUNCTION public.claim_public_purchase_provisioning(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_public_purchase_provisioning(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.complete_public_purchase(_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE r public.public_subscription_purchases;
BEGIN
 SELECT * INTO r FROM public.public_subscription_purchases WHERE id=_id FOR UPDATE;
 IF r.id IS NULL OR r.user_id IS DISTINCT FROM auth.uid() OR r.status NOT IN ('paid','activated') THEN RAISE EXCEPTION 'Acesso não autorizado'; END IF;
 UPDATE public.public_subscription_purchases SET status='activated',activated_at=coalesce(activated_at,now()),invite_token_hash=NULL WHERE id=_id;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.complete_public_purchase(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.complete_public_purchase(uuid) TO authenticated;
