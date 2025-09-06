-- First check if demo store exists, if not create it
INSERT INTO public.stores (owner_id, name, slug, description, niche, is_active, logo_url, banner_url, theme) 
VALUES (
  gen_random_uuid(), 
  'Loja Demo - Cursos de Tecnologia',
  'demo',
  'Demonstração da plataforma Nexus Market com cursos de programação e tecnologia',
  'tecnologia',
  true,
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&crop=center',
  '{"primaryColor": "#3b82f6", "secondaryColor": "#6366f1", "accentColor": "#f59e0b"}'::jsonb
);

-- Get the demo store id
WITH demo_store_id AS (
  SELECT id FROM public.stores WHERE slug = 'demo' LIMIT 1
)
-- Insert demo products
INSERT INTO public.products (store_id, title, slug, description, thumbnail_url, type, price_cents, status, is_active, featured)
SELECT 
  demo_store_id.id,
  'Curso Completo de React 2024',
  'curso-react-2024-demo-' || gen_random_uuid(),
  'Aprenda React do zero ao avançado com projetos práticos e as melhores práticas do mercado.',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop&crop=center',
  'curso',
  19900,
  'published',
  true,
  true
FROM demo_store_id
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE title = 'Curso Completo de React 2024');

-- Insert member area config
INSERT INTO public.member_area_configs (store_id, primary_color, secondary_color, welcome_message, show_other_products, show_progress_tracking, is_active)
SELECT 
  id,
  '#3b82f6',
  '#6366f1', 
  'Bem-vindo à nossa área de membros! Aqui você encontra todos os seus cursos e materiais exclusivos.',
  true,
  true,
  true
FROM public.stores 
WHERE slug = 'demo'
AND NOT EXISTS (SELECT 1 FROM public.member_area_configs WHERE store_id = stores.id);