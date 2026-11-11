DROP POLICY IF EXISTS "users read announcements" ON public.system_announcements;
CREATE POLICY "users read active announcements" ON public.system_announcements FOR SELECT TO authenticated USING (active = true);

-- Public bucket files stay reachable by URL; listing/reading via API is limited to org members.
DROP POLICY IF EXISTS organization_assets_read ON storage.objects;
CREATE POLICY organization_assets_read ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'organization-assets' AND public.is_org_member((storage.foldername(name))[1]::uuid));