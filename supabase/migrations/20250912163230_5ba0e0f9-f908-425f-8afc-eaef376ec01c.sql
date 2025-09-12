-- FASE 1: Criar 4 produtos para a loja "Nexus Criminal"
INSERT INTO public.products (
  id,
  title,
  description,
  price_cents,
  compare_price_cents,
  type,
  status,
  store_id,
  thumbnail_url,
  featured,
  total_lessons,
  total_duration_minutes,
  created_at,
  updated_at
) VALUES 
-- Curso Completo de Direito Criminal
(
  gen_random_uuid(),
  'Curso de Direito Criminal Avançado',
  'Curso completo sobre direito criminal com casos práticos, jurisprudência atualizada e técnicas avançadas de defesa. Inclui certificado de conclusão e materiais complementares.',
  49700,
  79700,
  'curso',
  'published',
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800&h=600&fit=crop',
  true,
  45,
  2700,
  now(),
  now()
),
-- E-book Guia Prático
(
  gen_random_uuid(),
  'Guia Prático de Petições Criminais',
  'E-book completo com modelos de petições criminais, dicas práticas e estratégias comprovadas. Mais de 200 páginas de conteúdo exclusivo.',
  9700,
  14700,
  'digital',
  'published',
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  true,
  NULL,
  NULL,
  now(),
  now()
),
-- Pack de Templates
(
  gen_random_uuid(),
  'Templates de Contratos Jurídicos',
  'Coleção completa de templates editáveis para contratos jurídicos. Inclui contratos de prestação de serviços, assessoria e consultoria.',
  19700,
  29700,
  'digital',
  'published',
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
  false,
  NULL,
  NULL,
  now(),
  now()
),
-- Consultoria Individual
(
  gen_random_uuid(),
  'Consultoria Jurídica Individual 1h',
  'Sessão de consultoria jurídica individual de 1 hora via videoconferência. Análise de casos, orientações específicas e estratégias personalizadas.',
  30000,
  40000,
  'servico',
  'published',
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=600&fit=crop',
  false,
  NULL,
  60,
  now(),
  now()
);

-- FASE 2: Configurar área de membros para a loja
INSERT INTO public.member_area_configs (
  id,
  store_id,
  welcome_message,
  welcome_video_url,
  primary_color,
  secondary_color,
  custom_logo_url,
  show_progress_tracking,
  show_other_products,
  is_active,
  member_resources,
  exclusive_content,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'Bem-vindo à Nexus Criminal! Aqui você encontra os melhores conteúdos sobre direito criminal. Aproveite sua jornada de aprendizado.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '#dc2626',
  '#1f2937',
  'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=200&h=200&fit=crop',
  true,
  true,
  true,
  '[
    {
      "title": "Biblioteca de Jurisprudência",
      "description": "Acesso exclusivo à nossa biblioteca de jurisprudência atualizada",
      "url": "https://example.com/jurisprudencia",
      "type": "link"
    },
    {
      "title": "Grupo VIP no Telegram",
      "description": "Participe do nosso grupo exclusivo para networking",
      "url": "https://t.me/nexuscriminal",
      "type": "telegram"
    }
  ]'::jsonb,
  '[
    {
      "id": "1",
      "title": "Aulas Bônus Exclusivas",
      "content": "Acesso a aulas bônus não disponíveis publicamente",
      "type": "video",
      "duration": "2h30min"
    },
    {
      "id": "2", 
      "title": "Templates Exclusivos",
      "content": "Modelos de petições exclusivos para membros",
      "type": "download",
      "duration": null
    }
  ]'::jsonb,
  now(),
  now()
);

-- FASE 3: Criar perfil do cliente teste
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  phone,
  cpf,
  birth_date,
  is_verified,
  email_verified,
  phone_verified,
  cpf_verified,
  created_at,
  updated_at,
  last_login_at
) VALUES (
  gen_random_uuid(),
  'cliente.teste@gmail.com',
  'João Silva Test',
  'seller',
  '(11) 99999-8888',
  '123.456.789-10',
  '1985-03-15',
  true,
  true,
  true,
  true,
  now() - interval '7 days',
  now(),
  now() - interval '1 day'
);

-- FASE 4: Criar pedidos simulados e licenças
WITH cliente_id AS (
  SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1
),
loja_id AS (
  SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1
),
produtos AS (
  SELECT id, title, price_cents, type FROM public.products 
  WHERE store_id = (SELECT id FROM loja_id) 
  ORDER BY created_at
),
novo_pedido AS (
  INSERT INTO public.orders (
    id,
    user_id,
    total_cents,
    status,
    payment_status,
    payment_provider,
    currency,
    customer_name,
    customer_email,
    gateway_session_id,
    stripe_payment_intent_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    (SELECT id FROM cliente_id),
    66400, -- Curso (497) + E-book (97) = 594 reais
    'completed',
    'paid',
    'stripe',
    'BRL',
    'João Silva Test',
    'cliente.teste@gmail.com',
    'cs_test_' || substr(gen_random_uuid()::text, 1, 8),
    'pi_test_' || substr(gen_random_uuid()::text, 1, 8),
    now() - interval '3 days',
    now() - interval '3 days'
  ) RETURNING id, user_id
)
INSERT INTO public.order_items (
  id,
  order_id,
  product_id,
  quantity,
  unit_price_cents,
  seller_share_cents,
  platform_share_cents,
  created_at
) 
SELECT 
  gen_random_uuid(),
  novo_pedido.id,
  produtos.id,
  1,
  produtos.price_cents,
  (produtos.price_cents * 0.90)::integer,
  (produtos.price_cents * 0.10)::integer,
  now() - interval '3 days'
FROM novo_pedido, produtos 
WHERE produtos.title IN ('Curso de Direito Criminal Avançado', 'Guia Prático de Petições Criminais');

-- Criar licenças para os produtos comprados
WITH cliente_id AS (
  SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1
),
produtos_comprados AS (
  SELECT p.id FROM public.products p 
  WHERE p.store_id = (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1)
  AND p.title IN ('Curso de Direito Criminal Avançado', 'Guia Prático de Petições Criminais')
)
INSERT INTO public.licenses (
  id,
  user_id,
  product_id,
  order_id,
  is_active,
  created_at,
  expires_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM cliente_id),
  pc.id,
  (SELECT id FROM public.orders WHERE customer_email = 'cliente.teste@gmail.com' LIMIT 1),
  true,
  now() - interval '3 days',
  now() + interval '1 year'
FROM produtos_comprados pc;

-- FASE 5: Criar módulos e lições para o curso
WITH curso_id AS (
  SELECT id FROM public.products 
  WHERE title = 'Curso de Direito Criminal Avançado' 
  AND store_id = (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1)
  LIMIT 1
),
modulos AS (
  INSERT INTO public.modules (
    id,
    product_id,
    title,
    description,
    sort_order,
    created_at
  ) VALUES 
  (
    gen_random_uuid(),
    (SELECT id FROM curso_id),
    'Introdução ao Direito Criminal',
    'Conceitos fundamentais e princípios básicos do direito criminal brasileiro',
    1,
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM curso_id),
    'Teoria Geral do Delito',
    'Elementos do crime, tipicidade, ilicitude e culpabilidade',
    2,
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM curso_id),
    'Processo Penal na Prática',
    'Procedimentos processuais e estratégias de defesa',
    3,
    now()
  ) RETURNING id, title, sort_order
)
INSERT INTO public.lessons (
  id,
  module_id,
  title,
  description,
  content,
  video_url,
  video_duration_seconds,
  sort_order,
  is_preview,
  resources,
  created_at
)
SELECT 
  gen_random_uuid(),
  m.id,
  CASE 
    WHEN m.sort_order = 1 AND l.sort_order = 1 THEN 'Bem-vindo ao Curso'
    WHEN m.sort_order = 1 AND l.sort_order = 2 THEN 'História do Direito Criminal'
    WHEN m.sort_order = 1 AND l.sort_order = 3 THEN 'Fontes do Direito Criminal'
    WHEN m.sort_order = 2 AND l.sort_order = 1 THEN 'Elementos do Crime'
    WHEN m.sort_order = 2 AND l.sort_order = 2 THEN 'Tipicidade Penal'
    WHEN m.sort_order = 2 AND l.sort_order = 3 THEN 'Ilicitude e Culpabilidade'
    WHEN m.sort_order = 3 AND l.sort_order = 1 THEN 'Inquérito Policial'
    WHEN m.sort_order = 3 AND l.sort_order = 2 THEN 'Ação Penal'
    ELSE 'Estratégias de Defesa'
  END,
  CASE 
    WHEN m.sort_order = 1 THEN 'Introdução aos conceitos fundamentais'
    WHEN m.sort_order = 2 THEN 'Análise detalhada dos elementos'
    ELSE 'Aplicação prática no processo'
  END,
  'Conteúdo detalhado da aula com exemplos práticos e jurisprudência aplicável.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  1800, -- 30 minutos por aula
  l.sort_order,
  CASE WHEN m.sort_order = 1 AND l.sort_order = 1 THEN true ELSE false END,
  '[
    {
      "title": "Material de Apoio PDF",
      "url": "https://example.com/material.pdf",
      "type": "pdf"
    },
    {
      "title": "Jurisprudência Relacionada", 
      "url": "https://example.com/jurisprudencia.pdf",
      "type": "pdf"
    }
  ]'::jsonb,
  now()
FROM modulos m
CROSS JOIN (VALUES (1), (2), (3)) AS l(sort_order);

-- FASE 6: Criar progresso do curso para o cliente
WITH cliente_id AS (
  SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1
),
licao_ids AS (
  SELECT l.id FROM public.lessons l
  JOIN public.modules m ON m.id = l.module_id
  JOIN public.products p ON p.id = m.product_id
  WHERE p.title = 'Curso de Direito Criminal Avançado'
  ORDER BY m.sort_order, l.sort_order
  LIMIT 4 -- Primeiras 4 lições como concluídas
)
INSERT INTO public.lesson_progress (
  id,
  user_id,
  lesson_id,
  completed,
  progress_seconds,
  completed_at,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM cliente_id),
  li.id,
  true,
  1800,
  now() - interval '1 day',
  now() - interval '2 days',
  now() - interval '1 day'
FROM licao_ids li;

-- FASE 7: Criar dados de gamificação
INSERT INTO public.user_points (
  id,
  user_id,
  store_id,
  total_points,
  experience_points,
  level,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  150,
  350,
  2,
  now() - interval '3 days',
  now() - interval '1 day'
);

-- Criar achievements
INSERT INTO public.user_achievements (
  id,
  user_id,
  store_id,
  achievement_name,
  achievement_description,
  points_awarded,
  created_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'Primeira Compra',
  'Parabéns! Você fez sua primeira compra na loja',
  50,
  now() - interval '3 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'Estudante Dedicado',
  'Concluiu as primeiras 4 lições do curso',
  100,
  now() - interval '1 day'
);

-- FASE 8: Criar notificações de teste
INSERT INTO public.notifications (
  id,
  user_id,
  store_id,
  type,
  title,
  message,
  data,
  read,
  created_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'purchase_success',
  'Compra Realizada com Sucesso!',
  'Sua compra foi processada e você já pode acessar seus produtos na biblioteca.',
  '{"products": ["Curso de Direito Criminal Avançado", "Guia Prático de Petições Criminais"]}'::jsonb,
  false,
  now() - interval '3 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'achievement_earned',
  'Novo Achievement Desbloqueado!',
  'Parabéns! Você desbloqueou o achievement "Estudante Dedicado"',
  '{"achievement": "Estudante Dedicado", "points": 100}'::jsonb,
  false,
  now() - interval '1 day'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'steinhauser.haira@gmail.com' LIMIT 1),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'new_sale',
  'Nova Venda Realizada!',
  'Você teve uma nova venda: João Silva Test comprou 2 produtos',
  '{"customer": "João Silva Test", "total": "R$ 594,00", "products": 2}'::jsonb,
  false,
  now() - interval '3 days'
);

-- FASE 9: Criar sala de chat para a loja
INSERT INTO public.chat_rooms (
  id,
  store_id,
  name,
  description,
  is_private,
  created_by,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  'Discussões Gerais - Direito Criminal',
  'Espaço para discussões gerais sobre direito criminal, dúvidas e networking',
  false,
  (SELECT id FROM public.profiles WHERE email = 'steinhauser.haira@gmail.com' LIMIT 1),
  now() - interval '5 days'
);

-- Adicionar participantes ao chat
INSERT INTO public.chat_participants (
  id,
  room_id,
  user_id,
  joined_at,
  last_seen
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.chat_rooms WHERE name = 'Discussões Gerais - Direito Criminal' LIMIT 1),
  (SELECT id FROM public.profiles WHERE email = 'steinhauser.haira@gmail.com' LIMIT 1),
  now() - interval '5 days',
  now() - interval '1 hour'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.chat_rooms WHERE name = 'Discussões Gerais - Direito Criminal' LIMIT 1),
  (SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1),
  now() - interval '3 days',
  now() - interval '2 hours'
);

-- Criar mensagens de exemplo no chat
INSERT INTO public.chat_messages (
  id,
  room_id,
  user_id,
  message,
  message_type,
  created_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.chat_rooms WHERE name = 'Discussões Gerais - Direito Criminal' LIMIT 1),
  (SELECT id FROM public.profiles WHERE email = 'steinhauser.haira@gmail.com' LIMIT 1),
  'Bem-vindos ao nosso espaço de discussão! Sintam-se à vontade para compartilhar dúvidas e experiências.',
  'text',
  now() - interval '5 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.chat_rooms WHERE name = 'Discussões Gerais - Direito Criminal' LIMIT 1),
  (SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1),
  'Olá! Muito obrigado pelo conteúdo excelente. Já comecei o curso e está sendo muito esclarecedor.',
  'text',
  now() - interval '2 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.chat_rooms WHERE name = 'Discussões Gerais - Direito Criminal' LIMIT 1),
  (SELECT id FROM public.profiles WHERE email = 'steinhauser.haira@gmail.com' LIMIT 1),
  'Que bom que está gostando! Qualquer dúvida durante o curso, pode perguntar aqui que eu respondo.',
  'text',
  now() - interval '1 day'
);

-- FASE 10: Popular analytics com dados de teste
INSERT INTO public.cart_analytics (
  id,
  user_id,
  product_id,
  quantity,
  ip_address,
  created_at
) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1),
  p.id,
  1,
  '192.168.1.100'::inet,
  now() - interval random() * interval '7 days'
FROM public.products p 
WHERE p.store_id = (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1)
AND random() > 0.3; -- 70% dos produtos aparecem no analytics

-- Criar posts na comunidade
INSERT INTO public.community_posts (
  id,
  store_id,
  user_id,
  title,
  content,
  likes_count,
  comments_count,
  is_pinned,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  (SELECT id FROM public.profiles WHERE email = 'steinhauser.haira@gmail.com' LIMIT 1),
  'Bem-vindos à Comunidade Nexus Criminal!',
  'Estamos muito felizes em ter vocês aqui! Este é o espaço para compartilharmos conhecimentos, experiências e crescermos juntos na área do direito criminal. Não hesitem em fazer perguntas e compartilhar seus cases!',
  5,
  3,
  true,
  now() - interval '6 days',
  now() - interval '6 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1),
  (SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1),
  'Dúvida sobre Recurso em Flagrante',
  'Pessoal, estou com uma dúvida sobre o timing ideal para interpor recurso em flagrante. Alguém pode compartilhar experiências práticas?',
  2,
  1,
  false,
  now() - interval '2 days',
  now() - interval '2 days'
);