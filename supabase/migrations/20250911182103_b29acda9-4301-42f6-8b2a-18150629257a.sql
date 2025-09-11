-- Update RLS policies to exclude soft-deleted products
-- First, drop existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
DROP POLICY IF EXISTS "Store owners can manage their products" ON public.products;

-- Create new policies that exclude soft-deleted products
CREATE POLICY "Anyone can view published non-deleted products"
ON public.products
FOR SELECT
USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Store owners can manage their non-deleted products"
ON public.products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  ) 
  AND deleted_at IS NULL
);

CREATE POLICY "Store owners can view their own deleted products"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Update existing hooks to also filter by user's store ownership for dashboard
CREATE OR REPLACE FUNCTION public.get_user_products()
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  price_cents INTEGER,
  compare_price_cents INTEGER,
  type TEXT,
  featured BOOLEAN,
  total_lessons INTEGER,
  total_duration_minutes INTEGER,
  status TEXT,
  store_id UUID,
  category_id UUID,
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.title, p.description, p.thumbnail_url, p.price_cents,
    p.compare_price_cents, p.type, p.featured, p.total_lessons,
    p.total_duration_minutes, p.status, p.store_id, p.category_id,
    p.slug, p.created_at, p.updated_at
  FROM public.products p
  JOIN public.stores s ON s.id = p.store_id
  WHERE s.owner_id = auth.uid() 
    AND p.deleted_at IS NULL
  ORDER BY p.created_at DESC;
END;
$$;