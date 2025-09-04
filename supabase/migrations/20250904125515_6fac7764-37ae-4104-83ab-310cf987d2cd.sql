-- Create lessons for each module
INSERT INTO public.lessons (module_id, title, description, video_url, video_duration_seconds, content, sort_order, is_preview)
SELECT 
  m.id,
  'Aula ' || lesson_num || ': ' || 
  CASE 
    WHEN lesson_num = 1 AND m.sort_order = 0 THEN 'Boas-vindas e Introdução'
    WHEN lesson_num = 2 AND m.sort_order = 0 THEN 'Configuração do Ambiente'
    WHEN lesson_num = 3 AND m.sort_order = 0 THEN 'Primeiros Passos'
    WHEN lesson_num = 4 AND m.sort_order = 0 THEN 'Conceitos Básicos'
    WHEN lesson_num = 1 AND m.sort_order = 10 THEN 'Aprofundando os Conhecimentos'
    WHEN lesson_num = 2 AND m.sort_order = 10 THEN 'Técnicas Intermediárias'
    WHEN lesson_num = 3 AND m.sort_order = 10 THEN 'Casos de Uso Práticos'
    WHEN lesson_num = 4 AND m.sort_order = 10 THEN 'Exercícios Guiados'
    WHEN lesson_num = 1 AND m.sort_order = 20 THEN 'Técnicas Profissionais'
    WHEN lesson_num = 2 AND m.sort_order = 20 THEN 'Projeto Final - Parte 1'
    WHEN lesson_num = 3 AND m.sort_order = 20 THEN 'Projeto Final - Parte 2'
    ELSE 'Revisão e Certificação'
  END,
  CASE 
    WHEN lesson_num = 1 AND m.sort_order = 0 THEN 'Apresentação do curso e objetivos de aprendizagem'
    WHEN lesson_num = 2 AND m.sort_order = 0 THEN 'Como configurar todas as ferramentas necessárias'
    WHEN lesson_num = 3 AND m.sort_order = 0 THEN 'Seus primeiros exercícios práticos'
    WHEN lesson_num = 4 AND m.sort_order = 0 THEN 'Fundamentos essenciais que você precisa dominar'
    WHEN lesson_num = 1 AND m.sort_order = 10 THEN 'Conceitos mais avançados e suas aplicações'
    WHEN lesson_num = 2 AND m.sort_order = 10 THEN 'Técnicas intermediárias com exemplos práticos'
    WHEN lesson_num = 3 AND m.sort_order = 10 THEN 'Aplicando o conhecimento em situações reais'
    WHEN lesson_num = 4 AND m.sort_order = 10 THEN 'Exercícios práticos com orientação passo a passo'
    WHEN lesson_num = 1 AND m.sort_order = 20 THEN 'Domine as técnicas usadas pelos profissionais'
    WHEN lesson_num = 2 AND m.sort_order = 20 THEN 'Primeira parte do projeto completo'
    WHEN lesson_num = 3 AND m.sort_order = 20 THEN 'Finalizando e polindo seu projeto'
    ELSE 'Revisão completa e obtenção do certificado'
  END,
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  CASE 
    WHEN lesson_num = 1 THEN 480  -- 8 minutes
    WHEN lesson_num = 2 THEN 720  -- 12 minutes  
    WHEN lesson_num = 3 THEN 900  -- 15 minutes
    ELSE 1200 -- 20 minutes
  END,
  'Conteúdo detalhado da aula com explicações, exercícios e recursos adicionais. Esta aula aborda todos os pontos essenciais do tópico com exemplos práticos e dicas profissionais.',
  (lesson_num - 1) * 10,
  CASE WHEN lesson_num = 1 AND m.sort_order = 0 THEN true ELSE false END
FROM modules m
CROSS JOIN generate_series(1, 4) AS lesson_num
WHERE NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id = m.id)
ORDER BY m.id, lesson_num;