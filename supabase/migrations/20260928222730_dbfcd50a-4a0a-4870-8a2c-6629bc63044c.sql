CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_admins_self_read" ON public.platform_admins FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  paddle_subscription_id text NOT NULL UNIQUE,
  paddle_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','live')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_own_read" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.has_org_role(organization_id, ARRAY['owner'::public.app_role, 'admin'::public.app_role]));
CREATE INDEX subscriptions_user_environment_idx ON public.subscriptions(user_id, environment, created_at DESC);
CREATE INDEX subscriptions_organization_idx ON public.subscriptions(organization_id);
CREATE TRIGGER subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), split_part(COALESCE(NEW.email, 'Usuário'), '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_profile() TO service_role;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
$$;
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND environment = check_env
      AND (
        (status IN ('active', 'trialing', 'past_due') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  )
$$;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated, service_role;

CREATE POLICY "company_logos_read" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'company-logos' AND private.is_org_member((storage.foldername(name))[1]::uuid)
);
CREATE POLICY "company_logos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'company-logos' AND private.has_org_role((storage.foldername(name))[1]::uuid, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
);
CREATE POLICY "company_logos_update" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'company-logos' AND private.has_org_role((storage.foldername(name))[1]::uuid, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
) WITH CHECK (
  bucket_id = 'company-logos' AND private.has_org_role((storage.foldername(name))[1]::uuid, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
);
CREATE POLICY "company_logos_delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'company-logos' AND private.has_org_role((storage.foldername(name))[1]::uuid, ARRAY['owner'::public.app_role, 'admin'::public.app_role])
);