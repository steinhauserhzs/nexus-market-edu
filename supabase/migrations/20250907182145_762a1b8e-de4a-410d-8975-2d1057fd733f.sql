-- Set security_invoker on our public view to satisfy linter and enforce querying user's RLS
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'venues_public'
  ) THEN
    EXECUTE 'ALTER VIEW public.venues_public SET (security_invoker = true)';
    -- Optional: add security_barrier for extra safety (prevents certain planner optimizations)
    EXECUTE 'ALTER VIEW public.venues_public SET (security_barrier = true)';
  END IF;
END $$;