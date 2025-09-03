-- Criar produtos fake para demonstração
-- Vamos criar produtos para as lojas existentes ou criar algumas lojas exemplo

-- Primeiro vamos verificar se existem lojas, se não vamos criar produtos genéricos
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
  'Curso completo de React.js com projetos práticos. Aprenda hooks, context, routing, APIs e muito mais. Inclui 15 projetos reais para seu portfólio. Ideal para quem quer se tornar um desenvolvedor React profissional.',
  'react-zero-ao-profissional',
  29900, -- R$ 299,00
  39900, -- R$ 399,00
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1),
  'course',
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
  'Domine JavaScript moderno com ES6+, async/await, APIs, DOM manipulation, e frameworks. Ideal para iniciantes que querem se tornar desenvolvedores profissionais. Inclui projetos práticos e certificado.',
  'javascript-moderno-completo',
  24900, -- R$ 249,00
  34900,
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1),
  'course',
  'published',
  true,
  'beginner',
  'Curso JavaScript Completo e Moderno ES6+',
  'JavaScript do básico ao avançado. Aprenda a linguagem mais usada do mundo com projetos práticos e reais.',
  35,
  1800 -- 30 horas
),

(
  'Node.js e API REST Completo',
  'Aprenda a criar APIs robustas com Node.js, Express, MongoDB e muito mais. Curso prático com projetos reais e deploy na nuvem. Perfeito para backend developers.',
  'nodejs-api-rest-completo',
  32900, -- R$ 329,00
  44900,
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'desenvolvimento' LIMIT 1),
  'course',
  'published',
  false,
  'intermediate',
  'Node.js e API REST - Curso Completo Backend',
  'Crie APIs profissionais com Node.js, Express e MongoDB. Do básico ao deploy em produção.',
  42,
  2520 -- 42 horas
),

-- Cursos de Design
(
  'UI/UX Design Masterclass',
  'Aprenda a criar interfaces incríveis e experiências de usuário memoráveis. Inclui Figma, prototipagem, pesquisa de usuário, design system e criação de portfolio vencedor.',
  'ui-ux-design-masterclass',
  34900, -- R$ 349,00
  49900,
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'design' LIMIT 1),
  'course',
  'published',
  true,
  'intermediate',
  'UI/UX Design Masterclass - Figma e Prototipagem',
  'Torne-se um designer UI/UX profissional. Aprenda Figma, prototipagem, pesquisa de usuário e crie um portfólio vencedor.',
  45,
  2700 -- 45 horas
),

(
  'Design Gráfico para Redes Sociais',
  'Crie designs impactantes para Instagram, Facebook, LinkedIn e YouTube. Aprenda composição, cores, tipografia e automação no Canva e Photoshop. Mais de 100 templates inclusos.',
  'design-grafico-redes-sociais',
  19900, -- R$ 199,00
  27900,
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'design' LIMIT 1),
  'course',
  'published',
  false,
  'beginner',
  'Design Gráfico para Redes Sociais - Canva e Photoshop',
  'Aprenda a criar designs incríveis para redes sociais. Canva, Photoshop e técnicas profissionais de composição.',
  28,
  1680 -- 28 horas
),

-- Cursos de Marketing
(
  'Marketing Digital Completo 2024',
  'Aprenda Google Ads, Facebook Ads, Instagram Ads, SEO, email marketing, analytics e automação. Curso mais atualizado do mercado com estratégias que realmente funcionam.',
  'marketing-digital-completo-2024',
  27900, -- R$ 279,00
  39900,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1),
  'course',
  'published',
  true,
  'beginner',
  'Marketing Digital Completo 2024 - Google e Facebook Ads',
  'Domine o marketing digital do zero. Google Ads, Facebook Ads, SEO e email marketing com estratégias atualizadas.',
  52,
  3120 -- 52 horas
),

(
  'Growth Hacking e Vendas Online',
  'Estratégias avançadas de crescimento rápido, otimização de conversão, automação de vendas e scaling de negócios digitais. Para empreendedores ambiciosos.',
  'growth-hacking-vendas-online',
  39900, -- R$ 399,00
  54900,
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1),
  'course',
  'published',
  true,
  'advanced',
  'Growth Hacking e Vendas Online - Estratégias Avançadas',
  'Aprenda growth hacking, otimização de conversão e automação de vendas. Estratégias para escalar negócios digitais.',
  38,
  2280 -- 38 horas
),

-- Cursos de Negócios
(
  'Empreendedorismo Digital do Zero',
  'Da ideia ao primeiro milhão. Validação de ideias, MVP, modelo de negócio, captação de investimento, team building e escalabilidade. Curso completo para empreendedores.',
  'empreendedorismo-digital-zero',
  49900, -- R$ 499,00
  69900,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'negocios' LIMIT 1),
  'course',
  'published',
  true,
  'advanced',
  'Empreendedorismo Digital do Zero - Da Ideia ao Primeiro Milhão',
  'Aprenda a criar e escalar negócios digitais rentáveis. Estratégias comprovadas de empreendedores de sucesso.',
  65,
  3900 -- 65 horas
),

-- Cursos de Fotografia
(
  'Fotografia Profissional Completa',
  'Aprenda técnicas profissionais de fotografia. Equipamentos, composição, iluminação natural e artificial, edição avançada e como monetizar seu talento fotográfico.',
  'fotografia-profissional-completa',
  32900, -- R$ 329,00
  44900,
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'fotografia' LIMIT 1),
  'course',
  'published',
  true,
  'intermediate',
  'Fotografia Profissional Completa - Equipamentos e Técnicas',
  'Torne-se um fotógrafo profissional. Aprenda técnicas, equipamentos, composição e como monetizar sua paixão.',
  48,
  2880 -- 48 horas
),

(
  'Edição no Lightroom e Photoshop',
  'Domine as ferramentas profissionais de edição. Workflows otimizados, correções avançadas, criação de presets personalizados e técnicas cinematográficas.',
  'edicao-lightroom-photoshop',
  24900, -- R$ 249,00
  34900,
  'https://images.unsplash.com/photo-1550439062-609e1531270e?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'fotografia' LIMIT 1),
  'course',
  'published',
  false,
  'beginner',
  'Edição de Fotos - Lightroom e Photoshop Profissional',
  'Aprenda edição profissional de fotos. Lightroom, Photoshop e técnicas avançadas de pós-produção.',
  32,
  1920 -- 32 horas
),

-- Cursos de Idiomas
(
  'Inglês Fluente em 6 Meses',
  'Método revolucionário para aprender inglês. Conversação desde o primeiro dia, gramática descomplicada, imersão cultural e prática intensiva diária.',
  'ingles-fluente-6-meses',
  39900, -- R$ 399,00
  54900,
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'idiomas' LIMIT 1),
  'course',
  'published',
  true,
  'beginner',
  'Curso de Inglês Fluente em 6 Meses - Método Revolucionário',
  'Aprenda inglês de forma natural e eficiente. Método comprovado para alcançar fluência rapidamente.',
  90,
  5400 -- 90 horas
),

-- Cursos de Saúde
(
  'Nutrição e Emagrecimento Saudável',
  'Aprenda os fundamentos da nutrição, planejamento de refeições, suplementação inteligente e estratégias comprovadas para emagrecimento sustentável.',
  'nutricao-emagrecimento-saudavel',
  22900, -- R$ 229,00
  31900,
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'saude' LIMIT 1),
  'course',
  'published',
  true,
  'beginner',
  'Nutrição e Emagrecimento Saudável - Guia Completo',
  'Aprenda nutrição aplicada, planejamento de dietas e estratégias de emagrecimento saudável e sustentável.',
  25,
  1500 -- 25 horas
),

-- Cursos de Música
(
  'Violão do Básico ao Avançado',
  'Aprenda violão do zero ou aprimore sua técnica. Acordes, ritmos, solos, improvisação e repertório completo. Para todos os estilos musicais.',
  'violao-basico-avancado',
  27900, -- R$ 279,00
  38900,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'musica' LIMIT 1),
  'course',
  'published',
  true,
  'beginner',
  'Curso de Violão do Básico ao Avançado - Todos os Estilos',
  'Aprenda violão do zero ou aprimore sua técnica. Acordes, ritmos, solos e repertório completo.',
  45,
  2700 -- 45 horas
),

-- E-books e Templates
(
  'E-book: 101 Dicas de Produtividade',
  'Guia definitivo com 101 técnicas comprovadas para aumentar sua produtividade pessoal e profissional. Métodos práticos e aplicáveis imediatamente.',
  'ebook-101-dicas-produtividade',
  4900, -- R$ 49,00
  7900,
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'negocios' LIMIT 1),
  'ebook',
  'published',
  false,
  'beginner',
  'E-book 101 Dicas de Produtividade - Guia Definitivo',
  'Aumente sua produtividade com 101 dicas práticas e comprovadas. Métodos aplicáveis imediatamente.',
  NULL,
  NULL
),

(
  'Templates: Pack Instagram Profissional',
  'Mais de 200 templates editáveis para Stories, Posts, Reels e IGTV. Formatos PSD, Canva e Figma. Eleve o nível visual do seu perfil ou empresa.',
  'templates-pack-instagram-profissional',
  8900, -- R$ 89,00
  12900,
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
  (SELECT id FROM categories WHERE slug = 'design' LIMIT 1),
  'template',
  'published',
  true,
  'beginner',
  'Templates Instagram Pack Profissional - 200+ Designs',
  'Pack completo com mais de 200 templates para Instagram. Stories, Posts e Reels em PSD, Canva e Figma.',
  NULL,
  NULL
);