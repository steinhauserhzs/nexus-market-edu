-- Criar cliente teste com CPF válido
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
  '11144477735',
  '1985-03-15',
  true,
  true,
  true,
  true,
  now() - interval '7 days',
  now(),
  now() - interval '1 day'
) ON CONFLICT (email) DO UPDATE SET 
  cpf = '11144477735',
  cpf_verified = true,
  updated_at = now();

-- Criar pedido e licenças para o cliente teste
WITH cliente_id AS (
  SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1
),
loja_id AS (
  SELECT id FROM public.stores WHERE slug = 'nexus-criminal' LIMIT 1
),
curso_produto AS (
  SELECT id, price_cents FROM public.products 
  WHERE store_id = (SELECT id FROM loja_id) 
  AND title = 'Curso de Direito Criminal Avançado'
  LIMIT 1
),
ebook_produto AS (
  SELECT id, price_cents FROM public.products 
  WHERE store_id = (SELECT id FROM loja_id) 
  AND title = 'Guia Prático de Petições Criminais'
  LIMIT 1
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
    59400, -- Total da compra
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
  curso_produto.id,
  1,
  curso_produto.price_cents,
  (curso_produto.price_cents * 0.90)::integer,
  (curso_produto.price_cents * 0.10)::integer,
  now() - interval '3 days'
FROM novo_pedido, curso_produto
UNION ALL
SELECT 
  gen_random_uuid(),
  novo_pedido.id,
  ebook_produto.id,
  1,
  ebook_produto.price_cents,
  (ebook_produto.price_cents * 0.90)::integer,
  (ebook_produto.price_cents * 0.10)::integer,
  now() - interval '3 days'
FROM novo_pedido, ebook_produto;

-- Criar licenças para os produtos comprados
WITH cliente_id AS (
  SELECT id FROM public.profiles WHERE email = 'cliente.teste@gmail.com' LIMIT 1
),
order_ref AS (
  SELECT id FROM public.orders WHERE customer_email = 'cliente.teste@gmail.com' LIMIT 1
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
  (SELECT id FROM order_ref),
  true,
  now() - interval '3 days',
  now() + interval '1 year'
FROM produtos_comprados pc
ON CONFLICT (user_id, product_id) DO NOTHING;