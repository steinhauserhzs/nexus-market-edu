-- Fix infinite recursion in RLS policies for public.profiles (v2)

-- 1) Helper functions executed as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(public.get_current_user_role(), '') = 'admin';
$$;

-- 2) Ensure RLS enabled and drop existing policies to avoid recursion
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT polname FROM pg_policy WHERE polrelid = 'public.profiles'::regclass
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.polname);
  END LOOP;
END $$;

-- 3) Recreate minimal safe policies
CREATE POLICY "profiles_select_self_or_admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_current_user_admin());

CREATE POLICY "profiles_update_self_or_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_current_user_admin())
WITH CHECK (id = auth.uid() OR public.is_current_user_admin());

-- Note: INSERT handled by SECURITY DEFINER trigger public.handle_new_user; no public INSERT policy added.