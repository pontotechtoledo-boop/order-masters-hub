ALTER TABLE public.organizations ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '3 days');
UPDATE public.organizations SET trial_ends_at = created_at + interval '3 days' WHERE trial_ends_at > created_at + interval '3 days';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (lower(username)) WHERE username IS NOT NULL;
CREATE OR REPLACE FUNCTION public.profiles_fill_username() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.username IS NULL THEN
    SELECT nullif(trim(raw_user_meta_data->>'username'),'') INTO NEW.username FROM auth.users WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_fill_username ON public.profiles;
CREATE TRIGGER profiles_fill_username BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profiles_fill_username();
UPDATE public.profiles p SET username = 'MT6 CELULARES' FROM auth.users u WHERE u.id = p.id AND lower(u.email) = 'mt6celular1543@gmail.com' AND p.username IS NULL;
UPDATE public.profiles p SET username = 'PONTO TECH ASSISTENCIA TECNICA' FROM auth.users u WHERE u.id = p.id AND lower(u.email) = 'pontotechtoledo@gmail.com' AND p.username IS NULL;
CREATE OR REPLACE FUNCTION public.username_available(_username text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(trim(_username)));
$$;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO anon, authenticated;