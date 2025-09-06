-- Create demo user profile first
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  gen_random_uuid(),
  'demo@nexusmarket.com',
  'Demo User',
  'seller'
) 
ON CONFLICT (email) DO NOTHING;

-- Create demo store using the demo user
INSERT INTO public.stores (owner_id, name, slug, description, niche, is_active, logo_url, banner_url, theme) 
SELECT 
  p.id,
  'Loja Demo - Cursos de Tecnologia',
  'demo',
  'Demonstração da plataforma Nexus Market com cursos de programação e tecnologia',
  'tecnologia',
  true,
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&crop=center',
  '{"primaryColor": "#3b82f6", "secondaryColor": "#6366f1", "accentColor": "#f59e0b"}'::jsonb
FROM public.profiles p
WHERE p.email = 'demo@nexusmarket.com'
AND NOT EXISTS (SELECT 1 FROM public.stores WHERE slug = 'demo');

-- Create demo products
INSERT INTO public.products (store_id, title, slug, description, thumbnail_url, type, price_cents, status, is_active, featured)
SELECT 
  s.id,
  'Curso Completo de React 2024',
  'curso-react-2024-demo',
  'Aprenda React do zero ao avançado com projetos práticos e as melhores práticas do mercado.',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop&crop=center',
  'curso',
  19900,
  'published',
  true,
  true
FROM public.stores s
WHERE s.slug = 'demo'
AND NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'curso-react-2024-demo');

-- Create member area config
INSERT INTO public.member_area_configs (store_id, primary_color, secondary_color, welcome_message, show_other_products, show_progress_tracking, is_active)
SELECT 
  s.id,
  '#3b82f6',
  '#6366f1', 
  'Bem-vindo à nossa área de membros! Aqui você encontra todos os seus cursos e materiais exclusivos.',
  true,
  true,
  true
FROM public.stores s
WHERE s.slug = 'demo'
AND NOT EXISTS (SELECT 1 FROM public.member_area_configs WHERE store_id = s.id);