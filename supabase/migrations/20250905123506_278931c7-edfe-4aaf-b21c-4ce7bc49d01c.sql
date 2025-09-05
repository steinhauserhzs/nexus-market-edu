-- Limpar produtos duplicados mantendo apenas o mais recente de cada slug
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at DESC) as row_num
  FROM products
)
DELETE FROM products 
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Inserir produtos de demonstração únicos se não existirem
INSERT INTO products (
  title, 
  slug, 
  description, 
  price_cents, 
  compare_price_cents,
  type, 
  status, 
  featured, 
  total_lessons, 
  total_duration_minutes,
  difficulty_level,
  thumbnail_url,
  meta_title,
  meta_description
) 
SELECT * FROM (VALUES 
  (
    'Curso Completo de React 2024',
    'curso-react-2024',
    'Aprenda React do zero ao avançado com projetos práticos e as mais novas features do React 18.',
    19900,
    29900,
    'curso',
    'published',
    true,
    45,
    720,
    'intermediario',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop&crop=center',
    'Curso Completo de React 2024 - Do Zero ao Avançado',
    'Master React 2024 com hooks, context, routing e muito mais. Projetos práticos incluídos.'
  ),
  (
    'JavaScript Moderno ES6+',
    'javascript-moderno-es6',
    'Domine o JavaScript moderno com ES6, ES7, ES8 e as últimas features da linguagem.',
    14900,
    24900,
    'curso',
    'published',
    true,
    32,
    480,
    'iniciante',
    'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=300&fit=crop&crop=center',
    'JavaScript Moderno ES6+ - Completo',
    'Aprenda JavaScript moderno do básico ao avançado com projetos reais.'
  ),
  (
    'Node.js e MongoDB',
    'nodejs-mongodb-completo',
    'Desenvolvimento backend completo com Node.js, Express e MongoDB.',
    17900,
    27900,
    'curso',
    'published',
    false,
    38,
    640,
    'avancado',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&crop=center',
    'Node.js e MongoDB - Backend Completo',
    'Crie APIs robustas com Node.js, Express e MongoDB. Autenticação e deployment incluídos.'
  ),
  (
    'Design System com Tailwind',
    'design-system-tailwind',
    'Crie design systems profissionais usando Tailwind CSS e componentização.',
    12900,
    19900,
    'curso',
    'published',
    true,
    25,
    380,
    'intermediario',
    'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=300&fit=crop&crop=center',
    'Design System com Tailwind CSS',
    'Domine Tailwind CSS e crie design systems escaláveis e profissionais.'
  ),
  (
    'Bundle Full Stack Developer',
    'bundle-full-stack-dev',
    'Pacote completo para se tornar um desenvolvedor full stack. React + Node.js + MongoDB.',
    39900,
    79900,
    'bundle',
    'published',
    true,
    120,
    1800,
    'avancado',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    'Bundle Full Stack Developer - Completo',
    'Torne-se um desenvolvedor full stack completo com este pacote de cursos.'
  )
) AS v(title, slug, description, price_cents, compare_price_cents, type, status, featured, total_lessons, total_duration_minutes, difficulty_level, thumbnail_url, meta_title, meta_description)
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE slug = v.slug
);