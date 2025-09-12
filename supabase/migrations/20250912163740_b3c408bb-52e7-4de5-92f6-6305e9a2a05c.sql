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
  slug,
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
  'curso-direito-criminal-avancado',
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
  'guia-pratico-peticoes-criminais',
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
  'templates-contratos-juridicos',
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
  'consultoria-juridica-individual-1h',
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
) ON CONFLICT (email) DO NOTHING;

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
  AND title IN ('Curso de Direito Criminal Avançado', 'Guia Prático de Petições Criminais')
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
    59400, -- Curso (497) + E-book (97) = 594 reais
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
FROM novo_pedido, produtos;

-- Criar licenças para os produtos comprados
WITH cliente_id AS (
  SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1
),
produtos_comprados AS (
  SELECT p.id FROM public.products p 
  WHERE p.store_id = (SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1)
  AND p.title IN ('Curso de Direito Criminal Avançado', 'Guia Prático de Petições Criminais')
),
order_id_ref AS (
  SELECT id FROM public.orders WHERE customer_email = 'cliente.teste@gmail.com' LIMIT 1
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
  (SELECT id FROM order_id_ref),
  true,
  now() - interval '3 days',
  now() + interval '1 year'
FROM produtos_comprados pc
ON CONFLICT (user_id, product_id) DO NOTHING;