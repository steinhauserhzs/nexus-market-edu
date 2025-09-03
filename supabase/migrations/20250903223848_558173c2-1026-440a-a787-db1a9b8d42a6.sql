-- Insert sample venues
INSERT INTO public.venues (name, address, city, state, capacity, description, contact_phone, contact_email, website_url, parking_available, accessibility_features, facilities) VALUES
('Teatro Municipal São Paulo', 'Praça Ramos de Azevedo, s/n - República', 'São Paulo', 'SP', 1500, 'Teatro histórico no centro de São Paulo', '(11) 3223-3022', 'contato@theatromunicipal.org.br', 'https://theatromunicipal.org.br', true, ARRAY['Cadeirante', 'Deficiente Visual'], ARRAY['Ar Condicionado', 'Som Profissional', 'Iluminação Cênica']),

('Espaço das Américas', 'R. Tagipuru, 795 - Barra Funda', 'São Paulo', 'SP', 7000, 'Casa de shows moderna com estrutura completa', '(11) 3864-5566', 'eventos@espacodasamericas.com.br', 'https://espacodasamericas.com.br', true, ARRAY['Cadeirante', 'Deficiente Auditivo'], ARRAY['Bar', 'Segurança 24h', 'Estacionamento']),

('Centro de Convenções Frei Caneca', 'R. Frei Caneca, 569 - Consolação', 'São Paulo', 'SP', 2500, 'Centro de convenções e eventos corporativos', '(11) 3472-2414', 'eventos@freicaneca.com.br', 'https://freicaneca.com.br', true, ARRAY['Cadeirante'], ARRAY['Wi-Fi', 'Projeção', 'Catering']);

-- Insert sample events using the first available organizer
DO $$
DECLARE
    organizer_id uuid;
    venue1_id uuid;
    venue2_id uuid;  
    venue3_id uuid;
    event1_id uuid;
    event2_id uuid;
    event3_id uuid;
BEGIN
    -- Get first available user as organizer
    SELECT id INTO organizer_id FROM auth.users LIMIT 1;
    
    -- Get venue IDs
    SELECT id INTO venue1_id FROM venues WHERE name = 'Teatro Municipal São Paulo';
    SELECT id INTO venue2_id FROM venues WHERE name = 'Espaço das Américas';
    SELECT id INTO venue3_id FROM venues WHERE name = 'Centro de Convenções Frei Caneca';
    
    -- Insert events
    INSERT INTO public.events (title, description, event_date, venue_id, organizer_id, category, event_type, status, price_from, max_capacity, banner_url, contact_email, contact_phone, is_featured, ticket_sales_start_date, ticket_sales_end_date, age_restriction, terms_and_conditions) VALUES
    ('Festival de Música Eletrônica 2024', 'O maior festival de música eletrônica do país com os melhores DJs nacionais e internacionais', '2024-03-15 20:00:00+00', venue2_id, organizer_id, 'Música', 'paid', 'published', 8000, 5000, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'contato@festiveletro.com.br', '(11) 99999-9999', true, '2024-01-01 00:00:00+00', '2024-03-14 23:59:59+00', '18+', 'Proibido entrada de menores. Consumação de bebidas alcoólicas apenas para maiores de 18 anos.'),
    
    ('Peça Teatral: O Fantasma da Ópera', 'Adaptação do clássico musical com elenco nacional renomado', '2024-02-20 19:30:00+00', venue1_id, organizer_id, 'Teatro', 'paid', 'published', 5000, 1200, 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800', 'bilheteria@teatromunicipal.org.br', '(11) 3223-3022', true, '2023-12-01 00:00:00+00', '2024-02-19 20:00:00+00', 'all_ages', 'Recomendado para todas as idades. Entrada permitida até 15 minutos após o início.'),
    
    ('Conferência Tech Innovation 2024', 'Maior evento de tecnologia e inovação do Brasil com palestrantes internacionais', '2024-04-10 09:00:00+00', venue3_id, organizer_id, 'Tecnologia', 'paid', 'published', 15000, 2000, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'inscricoes@techinnovation.com.br', '(11) 88888-8888', false, '2024-01-15 00:00:00+00', '2024-04-09 23:59:59+00', 'all_ages', 'Evento profissional. Networking e coffee break inclusos.');
    
    -- Get event IDs
    SELECT id INTO event1_id FROM events WHERE title = 'Festival de Música Eletrônica 2024';
    SELECT id INTO event2_id FROM events WHERE title = 'Peça Teatral: O Fantasma da Ópera'; 
    SELECT id INTO event3_id FROM events WHERE title = 'Conferência Tech Innovation 2024';
    
    -- Insert event tickets
    INSERT INTO public.event_tickets (event_id, name, description, price_cents, quantity_available, quantity_sold, sale_start_date, sale_end_date, is_active) VALUES
    -- Festival tickets
    (event1_id, 'Pista Premium', 'Acesso total ao festival com área VIP e open bar', 25000, 500, 120, '2024-01-01 00:00:00+00', '2024-03-14 23:59:59+00', true),
    (event1_id, 'Pista Comum', 'Acesso geral ao festival', 8000, 4000, 850, '2024-01-01 00:00:00+00', '2024-03-14 23:59:59+00', true),
    (event1_id, 'Camarote', 'Vista privilegiada com serviço de buffet', 45000, 200, 45, '2024-01-01 00:00:00+00', '2024-03-14 23:59:59+00', true),
    
    -- Teatro tickets
    (event2_id, 'Plateia', 'Assentos na plateia principal', 8000, 800, 234, '2023-12-01 00:00:00+00', '2024-02-19 20:00:00+00', true),
    (event2_id, 'Balcão', 'Assentos no balcão superior', 5000, 400, 156, '2023-12-01 00:00:00+00', '2024-02-19 20:00:00+00', true),
    
    -- Conference tickets
    (event3_id, 'Ingresso Individual', 'Acesso completo à conferência com material', 25000, 1500, 340, '2024-01-15 00:00:00+00', '2024-04-09 23:59:59+00', true),
    (event3_id, 'Ingresso Corporativo', 'Pacote para empresas (mínimo 5 pessoas)', 20000, 500, 89, '2024-01-15 00:00:00+00', '2024-04-09 23:59:59+00', true);
    
    -- Insert event images
    INSERT INTO public.event_images (event_id, image_url, alt_text, is_primary, sort_order) VALUES
    (event1_id, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'Festival de Música Eletrônica - Palco Principal', true, 1),
    (event1_id, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 'Festival de Música Eletrônica - Público', false, 2),
    (event2_id, 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800', 'O Fantasma da Ópera - Cena Principal', true, 1),
    (event2_id, 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800', 'Teatro Municipal - Interior', false, 2),
    (event3_id, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Tech Innovation - Auditório Principal', true, 1),
    (event3_id, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'Tech Innovation - Networking', false, 2);
    
END $$;