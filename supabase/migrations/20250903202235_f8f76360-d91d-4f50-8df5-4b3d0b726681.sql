-- Create storage buckets for store assets
INSERT INTO storage.buckets (id, name, public) VALUES ('store-logos', 'store-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('store-banners', 'store-banners', true);

-- Create policies for store logos bucket
CREATE POLICY "Store logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'store-logos');

CREATE POLICY "Users can upload their store logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'store-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their store logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'store-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their store logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'store-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policies for store banners bucket
CREATE POLICY "Store banners are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'store-banners');

CREATE POLICY "Users can upload their store banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'store-banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their store banners" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'store-banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their store banners" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'store-banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to generate unique store slug
CREATE OR REPLACE FUNCTION public.generate_store_slug(store_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 1;
BEGIN
  -- Create base slug from store name
  base_slug := lower(regexp_replace(store_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure minimum length
  IF length(base_slug) < 3 THEN
    base_slug := base_slug || '-store';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM stores WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;