-- Company profile fields and public logo storage for document branding.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS address text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-assets', 'organization-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS organization_assets_read ON storage.objects;
CREATE POLICY organization_assets_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'organization-assets');

DROP POLICY IF EXISTS organization_assets_insert ON storage.objects;
CREATE POLICY organization_assets_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'organization-assets'
    AND public.is_org_member((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS organization_assets_update ON storage.objects;
CREATE POLICY organization_assets_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'organization-assets'
    AND public.is_org_member((storage.foldername(name))[1]::uuid)
  )
  WITH CHECK (
    bucket_id = 'organization-assets'
    AND public.is_org_member((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS organization_assets_delete ON storage.objects;
CREATE POLICY organization_assets_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'organization-assets'
    AND public.is_org_member((storage.foldername(name))[1]::uuid)
  );
