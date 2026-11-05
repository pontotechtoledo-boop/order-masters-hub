CREATE OR REPLACE FUNCTION public.valid_registration_document(_value text) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE d text:=regexp_replace(coalesce(_value,''),'[^0-9]','','g'); n int; s int; r int; i int; j int; w int;
BEGIN
 n:=length(d); IF n NOT IN (11,14) OR d=repeat(substr(d,1,1),n) THEN RETURN false; END IF;
 FOR j IN 0..1 LOOP
 s:=0;
 IF n=11 THEN
 FOR i IN 1..(9+j) LOOP s:=s+substr(d,i,1)::int*(11+j-i); END LOOP;
 r:=(s*10)%11; IF r=10 THEN r:=0; END IF;
 IF r<>substr(d,10+j,1)::int THEN RETURN false; END IF;
 ELSE
 w:=5+j;
 FOR i IN 1..(12+j) LOOP s:=s+substr(d,i,1)::int*w; w:=w-1; IF w=1 THEN w:=9; END IF; END LOOP;
 r:=s%11; IF r<2 THEN r:=0; ELSE r:=11-r; END IF;
 IF r<>substr(d,13+j,1)::int THEN RETURN false; END IF;
 END IF;
 END LOOP;
 RETURN true;
END; $$;
CREATE OR REPLACE FUNCTION public.validate_signup_document() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.raw_user_meta_data ? 'company_name' AND NOT public.valid_registration_document(NEW.raw_user_meta_data->>'document') THEN RAISE EXCEPTION 'Informe um CPF ou CNPJ válido.'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_registration_document BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.validate_signup_document();
CREATE OR REPLACE FUNCTION public.ensure_user_organization() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth AS $$
DECLARE _user_id uuid:=auth.uid(); _email text; _full_name text; _org_name text; _document text; _org_id uuid;
BEGIN
 IF _user_id IS NULL THEN RAISE EXCEPTION 'Autenticação necessária'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(_user_id::text,0));
 SELECT om.organization_id INTO _org_id FROM public.organization_members om WHERE om.user_id=_user_id AND om.active=true ORDER BY om.created_at ASC LIMIT 1;
 IF _org_id IS NOT NULL THEN RETURN _org_id; END IF;
 SELECT lower(coalesce(u.email,'')),coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''),split_part(coalesce(u.email,'Usuário'),'@',1)),nullif(trim(u.raw_user_meta_data->>'company_name'),''),regexp_replace(coalesce(u.raw_user_meta_data->>'document',''),'[^0-9]','','g') INTO _email,_full_name,_org_name,_document FROM auth.users u WHERE u.id=_user_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Conta indisponível'; END IF;
 IF _document<>'' AND NOT public.valid_registration_document(_document) THEN RAISE EXCEPTION 'Informe um CPF ou CNPJ válido.'; END IF;
 INSERT INTO public.profiles(id,full_name) VALUES(_user_id,_full_name) ON CONFLICT(id) DO NOTHING;
 INSERT INTO public.organizations(name,email,document) VALUES(coalesce(_org_name,_full_name),_email,nullif(_document,'')) RETURNING id INTO _org_id;
 INSERT INTO public.organization_members(organization_id,user_id,role,active) VALUES(_org_id,_user_id,'owner',true);
 RETURN _org_id;
END; $$;
REVOKE ALL ON FUNCTION public.validate_signup_document() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.ensure_user_organization() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_organization() TO authenticated;
