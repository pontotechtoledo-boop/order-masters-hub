-- Safely provision one organization for an authenticated user who has no active membership.
-- This function never accepts a user ID or organization ID from the client.
CREATE OR REPLACE FUNCTION public.ensure_user_organization()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _email text;
  _full_name text;
  _org_name text;
  _org_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária';
  END IF;

  SELECT om.organization_id INTO _org_id
  FROM public.organization_members om
  WHERE om.user_id = _user_id AND om.active = true
  ORDER BY om.created_at ASC
  LIMIT 1;

  IF _org_id IS NOT NULL THEN
    RETURN _org_id;
  END IF;

  SELECT lower(coalesce(u.email,'')),
         coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'),''), split_part(coalesce(u.email,'Usuário'), '@', 1))
    INTO _email, _full_name
  FROM auth.users u
  WHERE u.id = _user_id;

  _org_name := CASE
    WHEN _email = 'mt6celular1543@gmail.com' THEN 'MT6 CELULARES'
    WHEN _email = 'pontotechtoledo@gmail.com' THEN 'PONTO TECH ASSISTENCIA TECNICA'
    ELSE coalesce(nullif(trim((SELECT u.raw_user_meta_data->>'company_name' FROM auth.users u WHERE u.id=_user_id)),''), _full_name)
  END;

  INSERT INTO public.profiles (id, full_name)
  VALUES (_user_id, _full_name)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.organizations (name, email)
  VALUES (_org_name, _email)
  RETURNING id INTO _org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role, active)
  VALUES (_org_id, _user_id, 'owner', true)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET active = true;

  RETURN _org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_organization() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_organization() TO authenticated;
