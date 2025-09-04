-- Populate categories with real data
INSERT INTO public.categories (name, slug, icon, description, is_active, sort_order) VALUES
('Desenvolvimento', 'desenvolvimento', '💻', 'Programação, desenvolvimento web, mobile e software', true, 1),
('Design', 'design', '🎨', 'Design gráfico, UX/UI, motion graphics e design digital', true, 2),
('Marketing', 'marketing', '📈', 'Marketing digital, redes sociais, publicidade e vendas', true, 3),
('Negócios', 'negocios', '💼', 'Empreendedorismo, gestão, finanças e estratégia', true, 4),
('Idiomas', 'idiomas', '🗣️', 'Cursos de inglês, espanhol, francês e outros idiomas', true, 5),
('Saúde', 'saude', '💪', 'Fitness, nutrição, bem-estar e saúde mental', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Create sample stores
INSERT INTO public.stores (name, slug, description, owner_id, is_active, logo_url, banner_url) VALUES
('Academia Tech', 'academia-tech', 'Cursos completos de desenvolvimento e tecnologia para todos os níveis', (SELECT id FROM auth.users LIMIT 1), true, '/placeholder.svg', '/placeholder.svg'),
('Design Pro', 'design-pro', 'Design profissional do básico ao avançado com projetos reais', (SELECT id FROM auth.users LIMIT 1), true, '/placeholder.svg', '/placeholder.svg'),
('Marketing Masters', 'marketing-masters', 'Estratégias de marketing digital que realmente funcionam', (SELECT id FROM auth.users LIMIT 1), true, '/placeholder.svg', '/placeholder.svg'),
('Business Expert', 'business-expert', 'Transforme suas ideias em negócios de sucesso', (SELECT id FROM auth.users LIMIT 1), true, '/placeholder.svg', '/placeholder.svg'),
('English Academy', 'english-academy', 'Aprenda inglês de forma prática e eficiente', (SELECT id FROM auth.users LIMIT 1), true, '/placeholder.svg', '/placeholder.svg')
ON CONFLICT (slug) DO NOTHING;

-- Update existing products to link with stores and categories
UPDATE public.products SET 
  store_id = (SELECT id FROM stores WHERE slug = 'academia-tech' LIMIT 1),
  category_id = (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1)
WHERE title ILIKE '%desenvolvimento%' OR title ILIKE '%react%' OR title ILIKE '%javascript%' OR title ILIKE '%python%';

UPDATE public.products SET 
  store_id = (SELECT id FROM stores WHERE slug = 'design-pro' LIMIT 1),
  category_id = (SELECT id FROM categories WHERE slug = 'design' LIMIT 1)
WHERE title ILIKE '%design%' OR title ILIKE '%ui%' OR title ILIKE '%ux%';

UPDATE public.products SET 
  store_id = (SELECT id FROM stores WHERE slug = 'marketing-masters' LIMIT 1),
  category_id = (SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1)
WHERE title ILIKE '%marketing%';

UPDATE public.products SET 
  store_id = (SELECT id FROM stores WHERE slug = 'business-expert' LIMIT 1),
  category_id = (SELECT id FROM categories WHERE slug = 'negocios' LIMIT 1)
WHERE title ILIKE '%negócio%' OR title ILIKE '%empreend%';

UPDATE public.products SET 
  store_id = (SELECT id FROM stores WHERE slug = 'english-academy' LIMIT 1),
  category_id = (SELECT id FROM categories WHERE slug = 'idiomas' LIMIT 1)
WHERE title ILIKE '%inglês%' OR title ILIKE '%english%';

-- For remaining products without category, assign to appropriate stores
UPDATE public.products SET 
  store_id = (SELECT id FROM stores WHERE slug = 'academia-tech' LIMIT 1),
  category_id = (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1)
WHERE store_id IS NULL AND category_id IS NULL;