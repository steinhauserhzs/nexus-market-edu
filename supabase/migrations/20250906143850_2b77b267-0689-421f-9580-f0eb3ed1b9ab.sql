-- Create demo store and sample data with auto-generated UUIDs
WITH demo_store AS (
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
  ) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active
  RETURNING id
),
demo_products AS (
  INSERT INTO public.products (store_id, title, slug, description, thumbnail_url, type, price_cents, status, is_active, featured)
  SELECT 
    demo_store.id,
    title,
    slug,
    description,
    thumbnail_url,
    type,
    price_cents,
    'published',
    true,
    featured
  FROM demo_store,
  (VALUES 
    ('Curso Completo de React 2024', 'curso-react-2024-demo', 'Aprenda React do zero ao avançado com projetos práticos e as melhores práticas do mercado.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop&crop=center', 'curso', 19900, true),
    ('Pack de Templates Figma', 'pack-templates-figma-demo', 'Mais de 50 templates profissionais para acelerar seus projetos de design.', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop&crop=center', 'pack', 9900, false),
    ('E-book: JavaScript Moderno', 'ebook-javascript-moderno-demo', 'Guia completo das funcionalidades mais recentes do JavaScript com exemplos práticos.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center', 'digital', 4900, false)
  ) AS p(title, slug, description, thumbnail_url, type, price_cents, featured)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active
  RETURNING store_id
)
INSERT INTO public.member_area_configs (store_id, primary_color, secondary_color, welcome_message, show_other_products, show_progress_tracking, is_active)
SELECT 
  demo_store.id,
  '#3b82f6',
  '#6366f1', 
  'Bem-vindo à nossa área de membros! Aqui você encontra todos os seus cursos e materiais exclusivos.',
  true,
  true,
  true
FROM demo_store
ON CONFLICT (store_id) DO UPDATE SET
  welcome_message = EXCLUDED.welcome_message,
  is_active = EXCLUDED.is_active;