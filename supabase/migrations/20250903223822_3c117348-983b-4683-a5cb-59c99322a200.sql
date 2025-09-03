-- Insert sample events with proper enum casting
WITH user_id AS (
  SELECT id FROM auth.users LIMIT 1  
)
INSERT INTO public.events (title, description, event_date, venue_id, organizer_id, category, event_type, status, price_from, max_capacity, banner_url, contact_email, contact_phone, is_featured, ticket_sales_start_date, ticket_sales_end_date, age_restriction, terms_and_conditions) 
SELECT 
  'Festival de Música Eletrônica 2024',
  'O maior festival de música eletrônica do país com os melhores DJs nacionais e internacionais', 
  '2024-03-15 20:00:00+00'::timestamptz,
  v.id,
  u.id,
  'Música',
  'paid',
  'published'::event_status,
  8000,
  5000,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  'contato@festiveletro.com.br',
  '(11) 99999-9999',
  true,
  '2024-01-01 00:00:00+00'::timestamptz,
  '2024-03-14 23:59:59+00'::timestamptz,
  '18+',
  'Proibido entrada de menores. Consumação de bebidas alcoólicas apenas para maiores de 18 anos.'
FROM venues v, user_id u
WHERE v.name = 'Espaço das Américas'
LIMIT 1

UNION ALL

SELECT 
  'Peça Teatral: O Fantasma da Ópera',
  'Adaptação do clássico musical com elenco nacional renomado',
  '2024-02-20 19:30:00+00'::timestamptz, 
  v.id,
  u.id,
  'Teatro',
  'paid',
  'published'::event_status,
  5000,
  1200,
  'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800',
  'bilheteria@teatromunicipal.org.br',
  '(11) 3223-3022',
  true,
  '2023-12-01 00:00:00+00'::timestamptz,
  '2024-02-19 20:00:00+00'::timestamptz,
  'all_ages',
  'Recomendado para todas as idades. Entrada permitida até 15 minutos após o início.'
FROM venues v, user_id u  
WHERE v.name = 'Teatro Municipal São Paulo'
LIMIT 1

UNION ALL

SELECT 
  'Conferência Tech Innovation 2024',
  'Maior evento de tecnologia e inovação do Brasil com palestrantes internacionais',
  '2024-04-10 09:00:00+00'::timestamptz,
  v.id,
  u.id,
  'Tecnologia',
  'paid', 
  'published'::event_status,
  15000,
  2000,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  'inscricoes@techinnovation.com.br',
  '(11) 88888-8888',
  false,
  '2024-01-15 00:00:00+00'::timestamptz, 
  '2024-04-09 23:59:59+00'::timestamptz,
  'all_ages',
  'Evento profissional. Networking e coffee break inclusos.'
FROM venues v, user_id u
WHERE v.name = 'Centro de Convenções Frei Caneca'
LIMIT 1;