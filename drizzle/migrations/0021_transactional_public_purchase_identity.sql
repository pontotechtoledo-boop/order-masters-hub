CREATE OR REPLACE FUNCTION public.claim_public_purchase_provisioning(_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN UPDATE public.public_subscription_purchases SET provisioning_until=now()+interval '2 minutes' WHERE id=_id AND status='paid' AND (provisioning_until IS NULL OR provisioning_until<now()); RETURN FOUND; END; $$;
CREATE OR REPLACE FUNCTION public.initialize_public_purchase_identity(_id uuid,_user_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE r public.public_subscription_purchases; org_id uuid;
BEGIN
 SELECT * INTO r FROM public.public_subscription_purchases WHERE id=_id FOR UPDATE;
 IF r.id IS NULL OR r.status<>'paid' OR r.user_id IS DISTINCT FROM _user_id OR NOT EXISTS(SELECT 1 FROM auth.users u WHERE u.id=_user_id AND lower(u.email)=r.email AND u.raw_user_meta_data->>'public_purchase_id'=r.id::text) THEN RAISE EXCEPTION 'Identidade de contratação inválida'; END IF;
 IF r.organization_id IS NOT NULL THEN RETURN r.organization_id; END IF;
 INSERT INTO public.organizations(name,email,document) VALUES(r.company_name,r.email,r.document) RETURNING id INTO org_id;
 INSERT INTO public.organization_members(organization_id,user_id,role,active) VALUES(org_id,_user_id,'owner',true);
 INSERT INTO public.subscription_checkouts(id,user_id,organization_id,price_id,environment,gateway_session_id) VALUES(r.id,_user_id,org_id,r.price_id,r.environment,r.gateway_session_id);
 UPDATE public.public_subscription_purchases SET organization_id=org_id WHERE id=_id;
 RETURN org_id;
END; $$;
REVOKE ALL ON FUNCTION public.initialize_public_purchase_identity(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_public_purchase_identity(uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.public_purchase_owned_user(_id uuid) RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path=public,auth AS $$ SELECT u.id FROM auth.users u JOIN public.public_subscription_purchases p ON p.email=lower(u.email) WHERE p.id=_id AND u.raw_user_meta_data->>'public_purchase_id'=p.id::text; $$;
REVOKE ALL ON FUNCTION public.public_purchase_owned_user(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.public_purchase_owned_user(uuid) TO service_role;
