-- Fix infinite recursion in RLS policies for public.profiles
-- 1) Create helper functions executed as SECURITY DEFINER

-- Returns role of current user without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Convenience function: is current user admin?
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(public.get_current_user_role(), '') = 'admin';
$$;

-- 2) Recreate RLS policies on public.profiles using the helper functions
DO $$
DECLARE r record;
BEGIN
  -- Ensure RLS is enabled
  EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';

  -- Drop existing policies to avoid recursion or duplication
  FOR r IN (
    SELECT polname FROM pg_policy WHERE polrelid = 'public.profiles'::regclass
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.polname);
  END LOOP;

  -- Users can view their own profile; admins can view all
  EXECUTE $$
    CREATE POLICY "profiles_select_self_or_admin"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_current_user_admin());
  $$;

  -- Users can update their own profile; admins can update all
  EXECUTE $$
    CREATE POLICY "profiles_update_self_or_admin"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.is_current_user_admin())
    WITH CHECK (id = auth.uid() OR public.is_current_user_admin());
  $$;

  -- Note: INSERT into profiles is handled by SECURITY DEFINER trigger (handle_new_user)
  -- No public insert policy is added to keep the table protected.
END $$;