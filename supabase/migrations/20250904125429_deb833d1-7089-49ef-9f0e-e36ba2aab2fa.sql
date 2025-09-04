-- Create modules for published products (courses)
INSERT INTO public.modules (product_id, title, description, sort_order) 
SELECT 
  p.id,
  'Módulo ' || row_number() OVER (PARTITION BY p.id ORDER BY p.id) || ': ' || 
  CASE 
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 'Introdução e Fundamentos'
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 'Conceitos Intermediários'
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 'Técnicas Avançadas'
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 4 THEN 'Projetos Práticos'
    ELSE 'Módulo Final e Certificação'
  END,
  CASE 
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 'Aprenda os conceitos básicos e prepare-se para a jornada'
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 'Aprofunde seus conhecimentos com conceitos intermediários'
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 'Domine técnicas avançadas e profissionais'
    WHEN row_number() OVER (PARTITION BY p.id ORDER BY p.id) = 4 THEN 'Aplique o conhecimento em projetos reais'
    ELSE 'Finalize sua formação e receba sua certificação'
  END,
  (row_number() OVER (PARTITION BY p.id ORDER BY p.id) - 1) * 10
FROM products p
CROSS JOIN generate_series(1, 3) AS module_series
WHERE p.status = 'published' 
  AND p.type IN ('curso', 'digital')
  AND NOT EXISTS (SELECT 1 FROM modules m WHERE m.product_id = p.id)
ORDER BY p.id, module_series;