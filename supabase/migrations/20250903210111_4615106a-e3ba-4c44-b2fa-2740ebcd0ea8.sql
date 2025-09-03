-- Criar produtos fake com tipos válidos
-- Verificando os tipos permitidos primeiro

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
-- Cursos de Desenvolvimento
(
  'React do Zero ao Profissional',
  'Curso completo de React.js com projetos práticos. Aprenda hooks, context, routing, APIs e muito mais. Inclui 15 projetos reais para seu portfólio.',
  'react-zero-ao-profissional',
  29900, -- R$ 299,00
  39900, -- R$ 399,00
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1),
  'digital', -- Usando 'digital' em vez de 'course'
  'published',
  true,
  'intermediate',
  'Curso React.js Completo - Do Zero ao Profissional',
  'Aprenda React.js do básico ao avançado com projetos práticos e mentoria. Curso mais vendido da categoria desenvolvimento.',
  48,
  2400 -- 40 horas
),

(
  'JavaScript Moderno ES6+ Completo',
  'Domine JavaScript moderno com ES6+, async/await, APIs, DOM manipulation, e frameworks. Ideal para iniciantes que querem se tornar desenvolvedores profissionais.',
  'javascript-moderno-completo',
  24900, -- R$ 249,00
  34900,
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Curso JavaScript Completo e Moderno ES6+',
  'JavaScript do básico ao avançado. Aprenda a linguagem mais usada do mundo com projetos práticos.',
  35,
  1800 -- 30 horas
),

(
  'Node.js e API REST Completo',
  'Aprenda a criar APIs robustas com Node.js, Express, MongoDB e muito mais. Curso prático com projetos reais e deploy na nuvem.',
  'nodejs-api-rest-completo',
  32900, -- R$ 329,00
  44900,
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1),
  'digital',
  'published',
  false,
  'intermediate',
  'Node.js e API REST - Curso Completo Backend',
  'Crie APIs profissionais com Node.js, Express e MongoDB. Do básico ao deploy.',
  42,
  2520 -- 42 horas
),

-- Cursos de Design
(
  'UI/UX Design Masterclass',
  'Aprenda a criar interfaces incríveis e experiências de usuário memoráveis. Inclui Figma, prototipagem, pesquisa de usuário e portfolio.',
  'ui-ux-design-masterclass',
  34900, -- R$ 349,00
  49900,
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'design' LIMIT 1),
  'digital',
  'published',
  true,
  'intermediate',
  'UI/UX Design Masterclass - Figma e Prototipagem',
  'Torne-se um designer UI/UX profissional. Aprenda Figma, prototipagem e crie um portfólio vencedor.',
  45,
  2700 -- 45 horas
),

(
  'Design Gráfico para Redes Sociais',
  'Crie designs impactantes para Instagram, Facebook, LinkedIn e YouTube. Aprenda composição, cores, tipografia no Canva e Photoshop.',
  'design-grafico-redes-sociais',
  19900, -- R$ 199,00
  27900,
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'design' LIMIT 1),
  'digital',
  'published',
  false,
  'beginner',
  'Design Gráfico para Redes Sociais - Canva e Photoshop',
  'Aprenda a criar designs incríveis para redes sociais. Canva, Photoshop e técnicas profissionais.',
  28,
  1680 -- 28 horas
),

-- Cursos de Marketing
(
  'Marketing Digital Completo 2024',
  'Aprenda Google Ads, Facebook Ads, Instagram Ads, SEO, email marketing, analytics e automação. Curso mais atualizado do mercado.',
  'marketing-digital-completo-2024',
  27900, -- R$ 279,00
  39900,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Marketing Digital Completo 2024 - Google e Facebook Ads',
  'Domine o marketing digital do zero. Google Ads, Facebook Ads, SEO com estratégias atualizadas.',
  52,
  3120 -- 52 horas
),

(
  'Growth Hacking e Vendas Online',
  'Estratégias avançadas de crescimento rápido, otimização de conversão, automação de vendas e scaling de negócios digitais.',
  'growth-hacking-vendas-online',
  39900, -- R$ 399,00
  54900,
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1),
  'digital',
  'published',
  true,
  'advanced',
  'Growth Hacking e Vendas Online - Estratégias Avançadas',
  'Aprenda growth hacking, otimização de conversão e automação de vendas.',
  38,
  2280 -- 38 horas
),

-- Cursos de Negócios
(
  'Empreendedorismo Digital do Zero',
  'Da ideia ao primeiro milhão. Validação de ideias, MVP, modelo de negócio, captação de investimento e escalabilidade.',
  'empreendedorismo-digital-zero',
  49900, -- R$ 499,00
  69900,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'negocios' LIMIT 1),
  'digital',
  'published',
  true,
  'advanced',
  'Empreendedorismo Digital do Zero - Da Ideia ao Primeiro Milhão',
  'Aprenda a criar e escalar negócios digitais rentáveis. Estratégias comprovadas.',
  65,
  3900 -- 65 horas
),

-- Cursos de Fotografia
(
  'Fotografia Profissional Completa',
  'Aprenda técnicas profissionais de fotografia. Equipamentos, composição, iluminação e como monetizar seu talento.',
  'fotografia-profissional-completa',
  32900, -- R$ 329,00
  44900,
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'fotografia' LIMIT 1),
  'digital',
  'published',
  true,
  'intermediate',
  'Fotografia Profissional Completa - Equipamentos e Técnicas',
  'Torne-se um fotógrafo profissional. Técnicas, equipamentos e monetização.',
  48,
  2880 -- 48 horas
),

-- Cursos de Idiomas
(
  'Inglês Fluente em 6 Meses',
  'Método revolucionário para aprender inglês. Conversação desde o primeiro dia, gramática descomplicada e imersão cultural.',
  'ingles-fluente-6-meses',
  39900, -- R$ 399,00
  54900,
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'idiomas' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Curso de Inglês Fluente em 6 Meses - Método Revolucionário',
  'Aprenda inglês de forma natural e eficiente. Método comprovado para fluência.',
  90,
  5400 -- 90 horas
),

-- Cursos de Saúde
(
  'Nutrição e Emagrecimento Saudável',
  'Aprenda nutrição, planejamento de refeições, suplementação e estratégias para emagrecimento sustentável.',
  'nutricao-emagrecimento-saudavel',
  22900, -- R$ 229,00
  31900,
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'saude' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Nutrição e Emagrecimento Saudável - Guia Completo',
  'Aprenda nutrição aplicada e estratégias de emagrecimento saudável.',
  25,
  1500 -- 25 horas
),

-- Cursos de Música
(
  'Violão do Básico ao Avançado',
  'Aprenda violão do zero ou aprimore sua técnica. Acordes, ritmos, solos, improvisação e repertório completo.',
  'violao-basico-avancado',
  27900, -- R$ 279,00
  38900,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'musica' LIMIT 1),
  'digital',
  'published',
  true,
  'beginner',
  'Curso de Violão do Básico ao Avançado - Todos os Estilos',
  'Aprenda violão do zero ou aprimore sua técnica. Repertório completo.',
  45,
  2700 -- 45 horas
);