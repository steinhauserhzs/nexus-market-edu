-- Fix store assets security vulnerability
-- Remove public access and implement proper authorization controls

-- Drop the overly permissive policy that allows anyone to view all store assets
DROP POLICY IF EXISTS "Anyone can view store assets" ON public.store_assets;

-- Create secure policies for store assets access
CREATE POLICY "Store owners can view their store assets"
ON public.store_assets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = store_assets.store_id 
    AND s.owner_id = auth.uid()
  )
);

-- Allow members with active licenses to view assets from stores they have access to
CREATE POLICY "Licensed members can view member area assets"
ON public.store_assets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.licenses l
    JOIN public.products p ON p.id = l.product_id
    WHERE p.store_id = store_assets.store_id
    AND l.user_id = auth.uid()
    AND l.is_active = true
  )
);

-- Log the security fix
INSERT INTO public.admin_logs (
  admin_id,
  action,
  target_type,
  target_id,
  details
) VALUES (
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'SECURITY_FIX_STORE_ASSETS_ACCESS',
  'store_assets',
  NULL,
  jsonb_build_object(
    'issue', 'PUBLIC_STORE_ASSETS_ACCESS',
    'fix_applied', 'RESTRICTED_TO_OWNERS_AND_MEMBERS',
    'previous_policy', 'Anyone can view store assets (PUBLIC ACCESS)',
    'new_policies', ARRAY[
      'Store owners can view their store assets',
      'Licensed members can view member area assets'
    ],
    'security_level', 'critical',
    'fixed_at', now()
  )
);