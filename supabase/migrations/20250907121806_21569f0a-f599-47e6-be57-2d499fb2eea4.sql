-- Add product_files column to store product files and external links
ALTER TABLE public.products 
ADD COLUMN product_files JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN public.products.product_files IS 'Array of file URLs and external links (YouTube, Google Drive, etc.) for the product';

-- Create index for better performance when querying product files
CREATE INDEX idx_products_product_files ON public.products USING GIN (product_files);