-- Inserir dados fake para demonstração

-- Primeiro, vamos criar alguns perfis fake de usuários/vendedores
INSERT INTO profiles (id, email, full_name, role, bio, avatar_url) VALUES
(gen_random_uuid(), 'maria.silva@email.com', 'Maria Silva', 'user', 'Especialista em desenvolvimento web com mais de 8 anos de experiência. Apaixonada por ensinar e compartilhar conhecimento.', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
(gen_random_uuid(), 'carlos.santos@email.com', 'Carlos Santos', 'user', 'Designer gráfico e UI/UX expert. Criador de cursos práticos e diretos ao ponto.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
(gen_random_uuid(), 'ana.costa@email.com', 'Ana Costa', 'user', 'Empreendedora digital e mentora de negócios. Fundadora de 3 startups de sucesso.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
(gen_random_uuid(), 'pedro.oliveira@email.com', 'Pedro Oliveira', 'user', 'Fotógrafo profissional especializado em retratos e eventos. Instrutor certificado.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
(gen_random_uuid(), 'julia.mendes@email.com', 'Julia Mendes', 'user', 'Professora de idiomas com formação internacional. Especialista em metodologias inovadoras.', 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face');

-- Agora vamos criar lojas para esses usuários
INSERT INTO stores (name, description, slug, owner_id, logo_url, banner_url, theme, is_active) 
SELECT 
  CASE 
    WHEN p.full_name = 'Maria Silva' THEN 'Dev Academy'
    WHEN p.full_name = 'Carlos Santos' THEN 'Design Studio Pro'
    WHEN p.full_name = 'Ana Costa' THEN 'Empreender Digital'
    WHEN p.full_name = 'Pedro Oliveira' THEN 'Fotografia Criativa'
    WHEN p.full_name = 'Julia Mendes' THEN 'Idiomas Sem Fronteiras'
  END as name,
  CASE 
    WHEN p.full_name = 'Maria Silva' THEN 'Cursos completos de programação e desenvolvimento web. Do básico ao avançado, com projetos práticos e mentoria personalizada.'
    WHEN p.full_name = 'Carlos Santos' THEN 'Aprenda design gráfico, UI/UX e branding com um profissional experiente. Cursos práticos e atualizados com as últimas tendências.'
    WHEN p.full_name = 'Ana Costa' THEN 'Transforme suas ideias em negócios de sucesso. Estratégias comprovadas de empreendedorismo digital e marketing online.'
    WHEN p.full_name = 'Pedro Oliveira' THEN 'Domine a arte da fotografia profissional. Técnicas, equipamentos e composição para criar imagens impactantes.'
    WHEN p.full_name = 'Julia Mendes' THEN 'Aprenda idiomas de forma natural e eficiente. Metodologias modernas para conquistar a fluência rapidamente.'
  END as description,
  CASE 
    WHEN p.full_name = 'Maria Silva' THEN 'dev-academy'
    WHEN p.full_name = 'Carlos Santos' THEN 'design-studio-pro'
    WHEN p.full_name = 'Ana Costa' THEN 'empreender-digital'
    WHEN p.full_name = 'Pedro Oliveira' THEN 'fotografia-criativa'
    WHEN p.full_name = 'Julia Mendes' THEN 'idiomas-sem-fronteiras'
  END as slug,
  p.id as owner_id,
  CASE 
    WHEN p.full_name = 'Maria Silva' THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop'
    WHEN p.full_name = 'Carlos Santos' THEN 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=200&h=200&fit=crop'
    WHEN p.full_name = 'Ana Costa' THEN 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop'
    WHEN p.full_name = 'Pedro Oliveira' THEN 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=200&h=200&fit=crop'
    WHEN p.full_name = 'Julia Mendes' THEN 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop'
  END as logo_url,
  CASE 
    WHEN p.full_name = 'Maria Silva' THEN 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=300&fit=crop'
    WHEN p.full_name = 'Carlos Santos' THEN 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=300&fit=crop'
    WHEN p.full_name = 'Ana Costa' THEN 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=300&fit=crop'
    WHEN p.full_name = 'Pedro Oliveira' THEN 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=300&fit=crop'
    WHEN p.full_name = 'Julia Mendes' THEN 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=300&fit=crop'
  END as banner_url,
  '{"primaryColor": "#3b82f6", "secondaryColor": "#6366f1", "accentColor": "#f59e0b", "backgroundColor": "#ffffff", "textColor": "#1f2937"}'::jsonb as theme,
  true as is_active
FROM profiles p 
WHERE p.email IN ('maria.silva@email.com', 'carlos.santos@email.com', 'ana.costa@email.com', 'pedro.oliveira@email.com', 'julia.mendes@email.com');

-- Agora vamos criar produtos variados para essas lojas
INSERT INTO products (title, description, slug, price_cents, compare_price_cents, thumbnail_url, store_id, category_id, type, status, featured, difficulty_level, meta_title, meta_description, total_lessons, total_duration_minutes) 
VALUES
-- Produtos da Dev Academy (Maria Silva) - Desenvolvimento
(
  'React do Zero ao Profissional',
  'Curso completo de React.js com projetos práticos. Aprenda hooks, context, routing, APIs e muito mais. Inclui 15 projetos reais para seu portfólio.',
  'react-zero-ao-profissional',
  29900, -- R$ 299,00
  39900, -- R$ 399,00 (preço comparativo)
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'dev-academy'),
  (SELECT id FROM categories WHERE slug = 'desenvolvimento'),
  'course',
  'published',
  true,
  'intermediary',
  'Curso React.js Completo - Do Zero ao Profissional',
  'Aprenda React.js do básico ao avançado com projetos práticos e mentoria. Curso mais vendido da categoria desenvolvimento.',
  48,
  2400 -- 40 horas
),

(
  'JavaScript Moderno Completo',
  'Domine JavaScript ES6+, async/await, APIs, DOM manipulation, e frameworks modernos. Ideal para iniciantes que querem se tornar desenvolvedores.',
  'javascript-moderno-completo',
  24900, -- R$ 249,00
  34900,
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'dev-academy'),
  (SELECT id FROM categories WHERE slug = 'desenvolvimento'),
  'course',
  'published',
  true,
  'beginner',
  'Curso JavaScript Completo e Moderno',
  'JavaScript do básico ao avançado. Aprenda a linguagem mais usada do mundo com projetos práticos.',
  35,
  1800 -- 30 horas
),

-- Produtos do Design Studio Pro (Carlos Santos) - Design
(
  'UI/UX Design Masterclass',
  'Aprenda a criar interfaces incríveis e experiências de usuário memoráveis. Inclui Figma, prototipagem, pesquisa de usuário e portfolio.',
  'ui-ux-design-masterclass',
  34900, -- R$ 349,00
  49900,
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'design-studio-pro'),
  (SELECT id FROM categories WHERE slug = 'design'),
  'course',
  'published',
  true,
  'intermediate',
  'UI/UX Design Masterclass - Figma e Prototipagem',
  'Torne-se um designer UI/UX profissional. Aprenda Figma, prototipagem, pesquisa de usuário e crie um portfólio vencedor.',
  42,
  2520 -- 42 horas
),

(
  'Design Gráfico para Redes Sociais',
  'Crie designs impactantes para Instagram, Facebook, LinkedIn e YouTube. Aprenda composição, cores, tipografia e automação no Canva e Photoshop.',
  'design-grafico-redes-sociais',
  19900, -- R$ 199,00
  27900,
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'design-studio-pro'),
  (SELECT id FROM categories WHERE slug = 'design'),
  'course',
  'published',
  false,
  'beginner',
  'Design Gráfico para Redes Sociais - Canva e Photoshop',
  'Aprenda a criar designs incríveis para redes sociais. Canva, Photoshop e técnicas profissionais de composição.',
  28,
  1400 -- 23.3 horas
),

-- Produtos do Empreender Digital (Ana Costa) - Negócios/Marketing
(
  'Empreendedorismo Digital Completo',
  'Da ideia ao primeiro milhão. Estratégias completas de negócios digitais, validação de ideias, MVP, growth hacking e escalabilidade.',
  'empreendedorismo-digital-completo',
  49900, -- R$ 499,00
  69900,
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'empreender-digital'),
  (SELECT id FROM categories WHERE slug = 'negocios'),
  'course',
  'published',
  true,
  'advanced',
  'Empreendedorismo Digital - Da Ideia ao Primeiro Milhão',
  'Aprenda a criar e escalar negócios digitais rentáveis. Estratégias comprovadas de empreendedores de sucesso.',
  60,
  3600 -- 60 horas
),

(
  'Marketing Digital Para Iniciantes',
  'Aprenda Google Ads, Facebook Ads, SEO, email marketing e analytics. Curso prático para quem quer começar no marketing digital.',
  'marketing-digital-iniciantes',
  27900, -- R$ 279,00
  39900,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'empreender-digital'),
  (SELECT id FROM categories WHERE slug = 'marketing'),
  'course',
  'published',
  true,
  'beginner',
  'Marketing Digital Para Iniciantes - Google e Facebook Ads',
  'Domine o marketing digital do zero. Google Ads, Facebook Ads, SEO e email marketing com estratégias práticas.',
  38,
  1900 -- 31.6 horas
),

-- Produtos da Fotografia Criativa (Pedro Oliveira) - Fotografia
(
  'Fotografia Profissional Completa',
  'Aprenda técnicas profissionais de fotografia. Equipamentos, composição, iluminação, edição e como monetizar seu talento.',
  'fotografia-profissional-completa',
  32900, -- R$ 329,00
  44900,
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'fotografia-criativa'),
  (SELECT id FROM categories WHERE slug = 'fotografia'),
  'course',
  'published',
  true,
  'intermediate',
  'Fotografia Profissional Completa - Equipamentos e Técnicas',
  'Torne-se um fotógrafo profissional. Aprenda técnicas, equipamentos, composição e como monetizar sua paixão.',
  45,
  2250 -- 37.5 horas
),

(
  'Edição de Fotos no Lightroom e Photoshop',
  'Domine as ferramentas profissionais de edição. Workflows eficientes, correções avançadas e criação de presets personalizados.',
  'edicao-fotos-lightroom-photoshop',
  24900, -- R$ 249,00
  34900,
  'https://images.unsplash.com/photo-1550439062-609e1531270e?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'fotografia-criativa'),
  (SELECT id FROM categories WHERE slug = 'fotografia'),
  'course',
  'published',
  false,
  'beginner',
  'Edição de Fotos - Lightroom e Photoshop Profissional',
  'Aprenda edição profissional de fotos. Lightroom, Photoshop e técnicas avançadas de pós-produção.',
  32,
  1600 -- 26.6 horas
),

-- Produtos do Idiomas Sem Fronteiras (Julia Mendes) - Idiomas
(
  'Inglês do Zero à Fluência',
  'Método revolucionário para aprender inglês. Conversação desde o primeiro dia, gramática descomplicada e imersão cultural.',
  'ingles-zero-fluencia',
  39900, -- R$ 399,00
  54900,
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'idiomas-sem-fronteiras'),
  (SELECT id FROM categories WHERE slug = 'idiomas'),
  'course',
  'published',
  true,
  'beginner',
  'Curso de Inglês do Zero à Fluência - Método Revolucionário',
  'Aprenda inglês de forma natural e eficiente. Método comprovado para alcançar fluência rapidamente.',
  80,
  4000 -- 66.6 horas
),

(
  'Espanhol Para Brasileiros',
  'Aprenda espanhol aproveitando as similaridades com português. Método específico para brasileiros com foco em conversação.',
  'espanhol-para-brasileiros',
  29900, -- R$ 299,00
  42900,
  'https://images.unsplash.com/photo-1543458999-e2ed9b7ae73a?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'idiomas-sem-fronteiras'),
  (SELECT id FROM categories WHERE slug = 'idiomas'),
  'course',
  'published',
  false,
  'beginner',
  'Curso de Espanhol Para Brasileiros - Método Específico',
  'Espanhol descomplicado para brasileiros. Aproveite as similaridades e fale espanhol rapidamente.',
  50,
  2500 -- 41.6 horas
),

-- Alguns produtos de diferentes tipos (ebooks, cursos)
(
  'E-book: 50 Dicas de Produtividade para Desenvolvedores',
  'Guia completo com técnicas comprovadas para aumentar sua produtividade como programador. Ferramentas, workflows e mindset vencedor.',
  'ebook-50-dicas-produtividade-dev',
  4900, -- R$ 49,00
  7900,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'dev-academy'),
  (SELECT id FROM categories WHERE slug = 'desenvolvimento'),
  'ebook',
  'published',
  false,
  'beginner',
  'E-book 50 Dicas de Produtividade para Desenvolvedores',
  'Aumente sua produtividade como programador com 50 dicas práticas e comprovadas.',
  NULL,
  NULL
),

(
  'Template: Kit Completo para Instagram',
  'Mais de 100 templates editáveis para Stories, Posts e Reels. Formato PSD e Canva. Eleve o nível visual do seu perfil.',
  'template-kit-instagram-completo',
  8900, -- R$ 89,00
  12900,
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
  (SELECT id FROM stores WHERE slug = 'design-studio-pro'),
  (SELECT id FROM categories WHERE slug = 'design'),
  'template',
  'published',
  false,
  'beginner',
  'Template Kit Instagram - 100+ Designs Editáveis',
  'Kit completo com mais de 100 templates para Instagram. Stories, Posts e Reels em PSD e Canva.',
  NULL,
  NULL
);