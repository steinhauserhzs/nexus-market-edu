-- Add multi-niche and hierarchy support to stores
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS niche text DEFAULT 'geral',
ADD COLUMN IF NOT EXISTS parent_store_id uuid REFERENCES public.stores(id),
ADD COLUMN IF NOT EXISTS support_channel_url text;

-- Add is_active field to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_stores_owner_niche ON public.stores(owner_id, niche);
CREATE INDEX IF NOT EXISTS idx_products_store_active ON public.products(store_id, is_active, status);

-- Update existing products to be published and active by default
UPDATE public.products 
SET 
  status = 'published',
  is_active = true
WHERE status IS NULL OR status NOT IN ('draft', 'published', 'archived');

-- Update RLS policies for products to include is_active filter
DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;
CREATE POLICY "Anyone can view published products" ON public.products
FOR SELECT USING (status = 'published' AND is_active = true);