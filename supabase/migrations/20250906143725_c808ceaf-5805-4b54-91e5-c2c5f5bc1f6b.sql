-- Create demo store and sample data with proper UUIDs
INSERT INTO public.stores (id, owner_id, name, slug, description, niche, is_active, logo_url, banner_url, theme) 
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-123456789012',
  'b2c3d4e5-f6g7-8901-bcde-234567890123', 
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
  is_active = EXCLUDED.is_active;

-- Create sample products for demo store
INSERT INTO public.products (id, store_id, title, slug, description, thumbnail_url, type, price_cents, status, is_active, featured)
VALUES 
(
  'c3d4e5f6-g7h8-9012-cdef-345678901234',
  'a1b2c3d4-e5f6-7890-abcd-123456789012',
  'Curso Completo de React 2024',
  'curso-react-2024-demo',
  'Aprenda React do zero ao avançado com projetos práticos e as melhores práticas do mercado.',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop&crop=center',
  'curso',
  19900,
  'published',
  true,
  true
),
(
  'd4e5f6g7-h8i9-0123-defg-456789012345', 
  'a1b2c3d4-e5f6-7890-abcd-123456789012',
  'Pack de Templates Figma',
  'pack-templates-figma-demo',
  'Mais de 50 templates profissionais para acelerar seus projetos de design.',
  'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop&crop=center',
  'pack',
  9900,
  'published',
  true,
  false
),
(
  'e5f6g7h8-i9j0-1234-efgh-567890123456',
  'a1b2c3d4-e5f6-7890-abcd-123456789012', 
  'E-book: JavaScript Moderno',
  'ebook-javascript-moderno-demo',
  'Guia completo das funcionalidades mais recentes do JavaScript com exemplos práticos.',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center',
  'digital',
  4900,
  'published',
  true,
  false
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active;

-- Create member area config for demo store
INSERT INTO public.member_area_configs (store_id, primary_color, secondary_color, welcome_message, show_other_products, show_progress_tracking, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-123456789012',
  '#3b82f6',
  '#6366f1', 
  'Bem-vindo à nossa área de membros! Aqui você encontra todos os seus cursos e materiais exclusivos.',
  true,
  true,
  true
) ON CONFLICT (store_id) DO UPDATE SET
  welcome_message = EXCLUDED.welcome_message,
  is_active = EXCLUDED.is_active;

-- Create sample exclusive content
INSERT INTO public.member_exclusive_content (store_id, title, content_type, content, description, sort_order, is_active)
VALUES 
(
  'a1b2c3d4-e5f6-7890-abcd-123456789012',
  'Guia de Setup Completo',
  'download',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'PDF com o passo a passo para configurar seu ambiente de desenvolvimento',
  1,
  true
),
(
  'a1b2c3d4-e5f6-7890-abcd-123456789012',
  'Comunidade no Discord',
  'link', 
  'https://discord.com',
  'Acesse nossa comunidade exclusiva para tirar dúvidas e networking',
  2,
  true
) ON CONFLICT (store_id, title) DO UPDATE SET
  content = EXCLUDED.content,
  is_active = EXCLUDED.is_active;