-- Avisos globais do Service Pro Hub.
-- Não remove dados existentes. A administração é separada por uma flag protegida.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS platform_owner boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.system_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.user_id = (SELECT auth.uid())
      AND om.active = true
      AND o.platform_owner = true
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_platform_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_owner() TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_platform_owner()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_org uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.organizations WHERE platform_owner = true) THEN
    RETURN false;
  END IF;

  SELECT om.organization_id
    INTO target_org
  FROM public.organization_members om
  WHERE om.user_id = (SELECT auth.uid())
    AND om.active = true
  ORDER BY om.created_at
  LIMIT 1;

  IF target_org IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.organizations
  SET platform_owner = true
  WHERE id = target_org
    AND NOT EXISTS (SELECT 1 FROM public.organizations WHERE platform_owner = true);

  RETURN FOUND;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_platform_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_platform_owner() TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can read active system announcements" ON public.system_announcements;
CREATE POLICY "Authenticated users can read active system announcements"
  ON public.system_announcements
  FOR SELECT
  TO authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Platform owner can create system announcements" ON public.system_announcements;
CREATE POLICY "Platform owner can create system announcements"
  ON public.system_announcements
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_platform_owner()));

DROP POLICY IF EXISTS "Platform owner can update system announcements" ON public.system_announcements;
CREATE POLICY "Platform owner can update system announcements"
  ON public.system_announcements
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_platform_owner()))
  WITH CHECK ((SELECT public.is_platform_owner()));

DROP POLICY IF EXISTS "Platform owner can delete system announcements" ON public.system_announcements;
CREATE POLICY "Platform owner can delete system announcements"
  ON public.system_announcements
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_platform_owner()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_announcements TO authenticated;

-- Impede que uma conta comum transforme a própria organização em administradora
-- da plataforma usando o UPDATE normal do navegador.
REVOKE UPDATE ON public.organizations FROM authenticated;
GRANT UPDATE (name, document, email, phone, address, logo_url) ON public.organizations TO authenticated;
