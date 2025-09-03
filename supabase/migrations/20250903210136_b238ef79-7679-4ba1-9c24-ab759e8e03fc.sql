-- Criar produtos fake usando apenas tipos válidos (digital, physical)
INSERT INTO products (
  title, 
  description, 
  slug, 
  price_cents, 
  compare_price_cents, 
  thumbnail_url, 
  category_id, 
  type, 
  status, 
  featured, 
  difficulty_level, 
  meta_title, 
  meta_description, 
  total_lessons, 
  total_duration_minutes
) VALUES
-- Cursos de Desenvolvimento (tipo digital)
(
  'React do Zero ao Profissional',
  'Curso completo de React.js com projetos práticos. Aprenda hooks, context, routing, APIs e muito mais. Inclui 15 projetos reais para seu portfólio.',
  'react-zero-ao-profissional',
  29900,
  39900,
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1),
  'digital',
  'published',
  true,
  'intermediate',
  'Curso React.js Completo - Do Zero ao Profissional',
  'Aprenda React.js do básico ao avançado com projetos práticos e mentoria.',
  48,
  2400
),

(
  'JavaScript Moderno ES6+ Completo',
  'Domine JavaScript moderno com ES6+, async/await, APIs, DOM manipulation, e frameworks. Ideal para iniciantes.',
  'javascript-moderno-completo',
  24900,
  34900,
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Curso JavaScript Completo e Moderno ES6+',
  'JavaScript do básico ao avançado. Aprenda a linguagem mais usada do mundo.',
  35,
  1800
),

(
  'Node.js e API REST Completo',
  'Aprenda a criar APIs robustas com Node.js, Express, MongoDB e muito mais. Curso prático com projetos reais.',
  'nodejs-api-rest-completo',
  32900,
  44900,
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1),
  'digital',
  'published',
  false,
  'intermediate',
  'Node.js e API REST - Curso Completo Backend',
  'Crie APIs profissionais com Node.js, Express e MongoDB.',
  42,
  2520
),

-- Cursos de Design
(
  'UI/UX Design Masterclass',
  'Aprenda a criar interfaces incríveis e experiências de usuário memoráveis. Inclui Figma, prototipagem e portfolio.',
  'ui-ux-design-masterclass',
  34900,
  49900,
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'design' LIMIT 1),
  'digital',
  'published',
  true,
  'intermediate',
  'UI/UX Design Masterclass - Figma e Prototipagem',
  'Torne-se um designer UI/UX profissional com Figma e prototipagem.',
  45,
  2700
),

(
  'Design Gráfico para Redes Sociais',
  'Crie designs impactantes para Instagram, Facebook, LinkedIn e YouTube. Canva e Photoshop inclusos.',
  'design-grafico-redes-sociais',
  19900,
  27900,
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'design' LIMIT 1),
  'digital',
  'published',
  false,
  'beginner',
  'Design Gráfico para Redes Sociais - Canva e Photoshop',
  'Aprenda design para redes sociais com Canva e Photoshop.',
  28,
  1680
),

-- Cursos de Marketing
(
  'Marketing Digital Completo 2024',
  'Aprenda Google Ads, Facebook Ads, Instagram Ads, SEO, email marketing e analytics. Curso atualizado.',
  'marketing-digital-completo-2024',
  27900,
  39900,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Marketing Digital Completo 2024 - Google e Facebook Ads',
  'Domine marketing digital com Google Ads, Facebook Ads e SEO.',
  52,
  3120
),

(
  'Growth Hacking e Vendas Online',
  'Estratégias avançadas de crescimento rápido, otimização de conversão e automação de vendas.',
  'growth-hacking-vendas-online',
  39900,
  54900,
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1),
  'digital',
  'published',
  true,
  'advanced',
  'Growth Hacking e Vendas Online - Estratégias Avançadas',
  'Aprenda growth hacking e automação de vendas para escalar negócios.',
  38,
  2280
),

-- Cursos de Negócios
(
  'Empreendedorismo Digital do Zero',
  'Da ideia ao primeiro milhão. Validação, MVP, modelo de negócio e escalabilidade.',
  'empreendedorismo-digital-zero',
  49900,
  69900,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'negocios' LIMIT 1),
  'digital',
  'published',
  true,
  'advanced',
  'Empreendedorismo Digital - Da Ideia ao Primeiro Milhão',
  'Crie e escale negócios digitais rentáveis com estratégias comprovadas.',
  65,
  3900
),

-- Cursos de Fotografia
(
  'Fotografia Profissional Completa',
  'Aprenda técnicas profissionais de fotografia. Equipamentos, composição, iluminação e monetização.',
  'fotografia-profissional-completa',
  32900,
  44900,
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'fotografia' LIMIT 1),
  'digital',
  'published',
  true,
  'intermediate',
  'Fotografia Profissional Completa - Equipamentos e Técnicas',
  'Torne-se fotógrafo profissional com técnicas e equipamentos.',
  48,
  2880
),

(
  'Edição no Lightroom e Photoshop',
  'Domine ferramentas profissionais de edição. Workflows, correções avançadas e presets.',
  'edicao-lightroom-photoshop',
  24900,
  34900,
  'https://images.unsplash.com/photo-1550439062-609e1531270e?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'fotografia' LIMIT 1),
  'digital',
  'published',
  false,
  'beginner',
  'Edição de Fotos - Lightroom e Photoshop Profissional',
  'Aprenda edição profissional com Lightroom e Photoshop.',
  32,
  1920
),

-- Cursos de Idiomas
(
  'Inglês Fluente em 6 Meses',
  'Método revolucionário para inglês. Conversação desde o primeiro dia, gramática descomplicada.',
  'ingles-fluente-6-meses',
  39900,
  54900,
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'idiomas' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Curso de Inglês Fluente em 6 Meses - Método Revolucionário',
  'Aprenda inglês naturalmente com método comprovado de fluência.',
  90,
  5400
),

-- Cursos de Saúde
(
  'Nutrição e Emagrecimento Saudável',
  'Fundamentos da nutrição, planejamento de refeições e estratégias de emagrecimento sustentável.',
  'nutricao-emagrecimento-saudavel',
  22900,
  31900,
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'saude' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Nutrição e Emagrecimento Saudável - Guia Completo',
  'Nutrição aplicada e estratégias de emagrecimento saudável.',
  25,
  1500
),

-- Cursos de Música
(
  'Violão do Básico ao Avançado',
  'Aprenda violão do zero. Acordes, ritmos, solos, improvisação e repertório completo.',
  'violao-basico-avancado',
  27900,
  38900,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'musica' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Curso de Violão do Básico ao Avançado',
  'Violão completo: acordes, ritmos, solos e repertório.',
  45,
  2700
);