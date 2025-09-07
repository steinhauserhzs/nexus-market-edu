-- Promote most recently logged-in user to admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM public.profiles
  ORDER BY COALESCE(last_login_at, created_at) DESC
  LIMIT 1
);