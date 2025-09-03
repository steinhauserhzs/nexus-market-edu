-- Atualizar produtos fake com dados mais realistas para demonstração
UPDATE products 
SET 
  description = CASE slug
    WHEN 'react-zero-ao-profissional' THEN 'Domine React.js do básico ao avançado! Aprenda hooks, context API, Redux, Next.js e muito mais. Construa projetos reais e torne-se um desenvolvedor React expert. Inclui projetos práticos, testes e deploy.'
    WHEN 'javascript-moderno-completo' THEN 'Aprenda JavaScript ES6+ moderno de forma completa! Desde fundamentos até conceitos avançados como async/await, destructuring, modules, e APIs. Perfeito para iniciantes e intermediários.'
    WHEN 'ui-ux-design-masterclass' THEN 'Masterclass completa de UI/UX Design! Aprenda princípios de design, Figma, prototipagem, pesquisa com usuários, design systems e muito mais. Do básico ao profissional.'
    WHEN 'nodejs-api-rest-completo' THEN 'Construa APIs REST robustas com Node.js! Express, MongoDB, autenticação JWT, validações, documentação com Swagger e deploy. Tudo que você precisa para backend profissional.'
    WHEN 'marketing-digital-completo-2024' THEN 'Marketing Digital Completo 2024! Google Ads, Facebook Ads, SEO, Email Marketing, Analytics, funis de vendas e muito mais. Estratégias atualizadas que realmente funcionam.'
    ELSE description
  END,
  total_lessons = CASE slug
    WHEN 'react-zero-ao-profissional' THEN 120
    WHEN 'javascript-moderno-completo' THEN 85
    WHEN 'ui-ux-design-masterclass' THEN 95
    WHEN 'nodejs-api-rest-completo' THEN 78
    WHEN 'marketing-digital-completo-2024' THEN 110
    ELSE COALESCE(total_lessons, 45)
  END,
  total_duration_minutes = CASE slug
    WHEN 'react-zero-ao-profissional' THEN 2400
    WHEN 'javascript-moderno-completo' THEN 1800
    WHEN 'ui-ux-design-masterclass' THEN 1950
    WHEN 'nodejs-api-rest-completo' THEN 1650
    WHEN 'marketing-digital-completo-2024' THEN 2200
    ELSE COALESCE(total_duration_minutes, 900)
  END,
  difficulty_level = CASE slug
    WHEN 'react-zero-ao-profissional' THEN 'intermediario'
    WHEN 'javascript-moderno-completo' THEN 'iniciante'
    WHEN 'ui-ux-design-masterclass' THEN 'intermediario'
    WHEN 'nodejs-api-rest-completo' THEN 'avancado'
    WHEN 'marketing-digital-completo-2024' THEN 'iniciante'
    ELSE 'iniciante'
  END,
  thumbnail_url = CASE slug
    WHEN 'react-zero-ao-profissional' THEN 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'
    WHEN 'javascript-moderno-completo' THEN 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop'
    WHEN 'ui-ux-design-masterclass' THEN 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop'
    WHEN 'nodejs-api-rest-completo' THEN 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop'
    WHEN 'marketing-digital-completo-2024' THEN 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
    ELSE thumbnail_url
  END,
  meta_description = CASE slug
    WHEN 'react-zero-ao-profissional' THEN 'Curso completo de React.js com projetos práticos, hooks, Redux e Next.js. Torne-se um desenvolvedor React profissional.'
    WHEN 'javascript-moderno-completo' THEN 'Aprenda JavaScript moderno ES6+ com projetos práticos. Do básico ao avançado com as melhores práticas.'
    WHEN 'ui-ux-design-masterclass' THEN 'Masterclass completa de UI/UX Design com Figma, prototipagem e design systems. Para iniciantes e avançados.'
    WHEN 'nodejs-api-rest-completo' THEN 'Curso completo de Node.js para criar APIs REST profissionais com Express, MongoDB e autenticação.'
    WHEN 'marketing-digital-completo-2024' THEN 'Marketing Digital completo 2024: Google Ads, Facebook Ads, SEO e funis de vendas que realmente funcionam.'
    ELSE meta_description
  END
WHERE slug IN ('react-zero-ao-profissional', 'javascript-moderno-completo', 'ui-ux-design-masterclass', 'nodejs-api-rest-completo', 'marketing-digital-completo-2024');