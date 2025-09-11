-- Completar criação das tabelas que faltam
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES public.profiles(id);

-- Políticas RLS simplificadas para stores
DROP POLICY IF EXISTS "Store owners can manage their stores" ON public.stores;
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;

CREATE POLICY "Store owners can manage their stores" 
ON public.stores FOR ALL 
USING (owner_id = auth.uid());

CREATE POLICY "Anyone can view active stores" 
ON public.stores FOR SELECT 
USING (is_active = true);

-- Políticas para produtos 
DROP POLICY IF EXISTS "Store owners can manage their products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view published products" ON public.products;

CREATE POLICY "Store owners can manage their products" 
ON public.products FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.stores s 
  WHERE s.id = products.store_id AND s.owner_id = auth.uid()
));

CREATE POLICY "Anyone can view published products" 
ON public.products FOR SELECT 
USING (status = 'published');

-- Função para gerar slug único de loja
CREATE OR REPLACE FUNCTION public.generate_store_slug(store_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Inserir categorias básicas se não existirem
INSERT INTO public.categories (name, slug, description, icon) VALUES
('Tecnologia', 'tecnologia', 'Cursos de programação, desenvolvimento e tecnologia', '💻'),
('Marketing', 'marketing', 'Marketing digital, vendas e publicidade', '📈'),
('Design', 'design', 'Design gráfico, UX/UI e criatividade', '🎨'),
('Negócios', 'negocios', 'Empreendedorismo, gestão e finanças', '💼'),
('Educação', 'educacao', 'Cursos educacionais e acadêmicos', '📚'),
('Saúde', 'saude', 'Bem-estar, fitness e saúde', '🏥'),
('Música', 'musica', 'Instrumentos, produção musical e teoria', '🎵'),
('Idiomas', 'idiomas', 'Aprendizado de idiomas', '🌍')
ON CONFLICT (slug) DO NOTHING;