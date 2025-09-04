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