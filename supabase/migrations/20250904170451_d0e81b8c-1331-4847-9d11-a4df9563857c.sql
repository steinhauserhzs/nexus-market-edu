-- Expandir sistema de customização de lojas
-- 1. Criar tabela para páginas personalizadas
CREATE TABLE public.store_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom', -- 'home', 'about', 'contact', 'custom'
  content JSONB NOT NULL DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, slug)
);

-- 2. Criar tabela para assets das lojas
CREATE TABLE public.store_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'font', 'css', 'js'
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Criar tabela para componentes salvos
CREATE TABLE public.store_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'header', 'hero', 'product_grid', 'footer', etc
  config JSONB NOT NULL DEFAULT '{}',
  preview_image TEXT,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar bucket para assets de lojas
INSERT INTO storage.buckets (id, name, public) VALUES ('store-assets', 'store-assets', true);

-- 5. Políticas RLS para store_pages
ALTER TABLE public.store_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their store pages"
ON public.store_pages
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.stores 
  WHERE stores.id = store_pages.store_id 
  AND stores.owner_id = auth.uid()
));

CREATE POLICY "Anyone can view published store pages"
ON public.store_pages
FOR SELECT
USING (is_published = true);

-- 6. Políticas RLS para store_assets
ALTER TABLE public.store_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their store assets"
ON public.store_assets
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.stores 
  WHERE stores.id = store_assets.store_id 
  AND stores.owner_id = auth.uid()
));

CREATE POLICY "Anyone can view store assets"
ON public.store_assets
FOR SELECT
USING (true);

-- 7. Políticas RLS para store_components
ALTER TABLE public.store_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their store components"
ON public.store_components
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.stores 
  WHERE stores.id = store_components.store_id 
  AND stores.owner_id = auth.uid()
));

CREATE POLICY "Store owners can view their components and public templates"
ON public.store_components
FOR SELECT
USING (
  is_template = true OR
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = store_components.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- 8. Políticas para storage bucket
CREATE POLICY "Store owners can upload assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'store-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Store owners can update their assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'store-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Store owners can delete their assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'store-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view store assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'store-assets');

-- 9. Triggers para updated_at
CREATE TRIGGER update_store_pages_updated_at
  BEFORE UPDATE ON public.store_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_store_assets_updated_at
  BEFORE UPDATE ON public.store_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_store_components_updated_at
  BEFORE UPDATE ON public.store_components
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();