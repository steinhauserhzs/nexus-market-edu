-- Insert sample venues
INSERT INTO public.venues (id, name, address, city, state, capacity, description, contact_phone, contact_email, website_url, parking_available, accessibility_features, facilities) VALUES
('11111111-1111-1111-1111-111111111111', 'Teatro Municipal São Paulo', 'Praça Ramos de Azevedo, s/n - República', 'São Paulo', 'SP', 1500, 'Teatro histórico no centro de São Paulo', '(11) 3223-3022', 'contato@theatromunicipal.org.br', 'https://theatromunicipal.org.br', true, ARRAY['Cadeirante', 'Deficiente Visual'], ARRAY['Ar Condicionado', 'Som Profissional', 'Iluminação Cênica']),

('22222222-2222-2222-2222-222222222222', 'Espaço das Américas', 'R. Tagipuru, 795 - Barra Funda', 'São Paulo', 'SP', 7000, 'Casa de shows moderna com estrutura completa', '(11) 3864-5566', 'eventos@espacodasamericas.com.br', 'https://espacodasamericas.com.br', true, ARRAY['Cadeirante', 'Deficiente Auditivo'], ARRAY['Bar', 'Segurança 24h', 'Estacionamento']),

('33333333-3333-3333-3333-333333333333', 'Centro de Convenções Frei Caneca', 'R. Frei Caneca, 569 - Consolação', 'São Paulo', 'SP', 2500, 'Centro de convenções e eventos corporativos', '(11) 3472-2414', 'eventos@freicaneca.com.br', 'https://freicaneca.com.br', true, ARRAY['Cadeirante'], ARRAY['Wi-Fi', 'Projeção', 'Catering']);

-- Insert sample events  
INSERT INTO public.events (id, title, description, event_date, venue_id, organizer_id, category, event_type, status, price_from, max_capacity, banner_url, contact_email, contact_phone, is_featured, ticket_sales_start_date, ticket_sales_end_date, age_restriction, terms_and_conditions) VALUES

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Festival de Música Eletrônica 2024', 'O maior festival de música eletrônica do país com os melhores DJs nacionais e internacionais', '2024-03-15 20:00:00+00', '22222222-2222-2222-2222-222222222222', (SELECT id FROM auth.users LIMIT 1), 'Música', 'paid', 'published', 8000, 5000, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'contato@festiveletro.com.br', '(11) 99999-9999', true, '2024-01-01 00:00:00+00', '2024-03-14 23:59:59+00', '18+', 'Proibido entrada de menores. Consumação de bebidas alcoólicas apenas para maiores de 18 anos.'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Peça Teatral: O Fantasma da Ópera', 'Adaptação do clássico musical com elenco nacional renomado', '2024-02-20 19:30:00+00', '11111111-1111-1111-1111-111111111111', (SELECT id FROM auth.users LIMIT 1), 'Teatro', 'paid', 'published', 5000, 1200, 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800', 'bilheteria@teatromunicipal.org.br', '(11) 3223-3022', true, '2023-12-01 00:00:00+00', '2024-02-19 20:00:00+00', 'all_ages', 'Recomendado para todas as idades. Entrada permitida até 15 minutos após o início.'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Conferência Tech Innovation 2024', 'Maior evento de tecnologia e inovação do Brasil com palestrantes internacionais', '2024-04-10 09:00:00+00', '33333333-3333-3333-3333-333333333333', (SELECT id FROM auth.users LIMIT 1), 'Tecnologia', 'paid', 'published', 15000, 2000, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'inscricoes@techinnovation.com.br', '(11) 88888-8888', false, '2024-01-15 00:00:00+00', '2024-04-09 23:59:59+00', 'all_ages', 'Evento profissional. Networking e coffee break inclusos.');

-- Insert sample event tickets
INSERT INTO public.event_tickets (id, event_id, name, description, price_cents, quantity_available, quantity_sold, sale_start_date, sale_end_date, is_active) VALUES

-- Festival de Música Eletrônica tickets
('t1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Pista Premium', 'Acesso total ao festival com área VIP e open bar', 25000, 500, 120, '2024-01-01 00:00:00+00', '2024-03-14 23:59:59+00', true),
('t2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Pista Comum', 'Acesso geral ao festival', 8000, 4000, 850, '2024-01-01 00:00:00+00', '2024-03-14 23:59:59+00', true),
('t3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Camarote', 'Vista privilegiada com serviço de buffet', 45000, 200, 45, '2024-01-01 00:00:00+00', '2024-03-14 23:59:59+00', true),

-- Teatro tickets  
('t4444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Plateia', 'Assentos na plateia principal', 8000, 800, 234, '2023-12-01 00:00:00+00', '2024-02-19 20:00:00+00', true),
('t5555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Balcão', 'Assentos no balcão superior', 5000, 400, 156, '2023-12-01 00:00:00+00', '2024-02-19 20:00:00+00', true),

-- Tech Conference tickets
('t6666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ingresso Individual', 'Acesso completo à conferência com material', 25000, 1500, 340, '2024-01-15 00:00:00+00', '2024-04-09 23:59:59+00', true),
('t7777777-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ingresso Corporativo', 'Pacote para empresas (mínimo 5 pessoas)', 20000, 500, 89, '2024-01-15 00:00:00+00', '2024-04-09 23:59:59+00', true);

-- Insert sample event images
INSERT INTO public.event_images (id, event_id, image_url, alt_text, is_primary, sort_order) VALUES
('i1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'Festival de Música Eletrônica - Palco Principal', true, 1),
('i2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 'Festival de Música Eletrônica - Público', false, 2),

('i3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800', 'O Fantasma da Ópera - Cena Principal', true, 1),
('i4444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800', 'Teatro Municipal - Interior', false, 2),

('i5555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Tech Innovation - Auditório Principal', true, 1),
('i6666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'Tech Innovation - Networking', false, 2);