-- Create demo profile and store with sample data
DO $$ 
DECLARE
    demo_user_id UUID := gen_random_uuid();
    store_id_var UUID;
BEGIN
    -- Check if demo store already exists
    SELECT id INTO store_id_var FROM public.stores WHERE slug = 'demo';
    
    -- If doesn't exist, create demo user and store
    IF store_id_var IS NULL THEN
        -- Create demo profile first
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (
            demo_user_id,
            'demo@nexusmarket.com',
            'Demo Producer',
            'seller'
        );
        
        -- Create demo store
        INSERT INTO public.stores (owner_id, name, slug, description, niche, is_active, logo_url, banner_url, theme) 
        VALUES (
            demo_user_id, 
            'Loja Demo - Cursos de Tecnologia',
            'demo',
            'Demonstração da plataforma Nexus Market com cursos de programação e tecnologia',
            'tecnologia',
            true,
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&crop=center',
            '{"primaryColor": "#3b82f6", "secondaryColor": "#6366f1", "accentColor": "#f59e0b"}'::jsonb
        ) RETURNING id INTO store_id_var;
        
        -- Create sample products
        INSERT INTO public.products (store_id, title, slug, description, thumbnail_url, type, price_cents, status, is_active, featured)
        VALUES 
        (store_id_var, 'Curso Completo de React 2024', 'curso-react-2024-demo', 'Aprenda React do zero ao avançado com projetos práticos e as melhores práticas do mercado.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop&crop=center', 'curso', 19900, 'published', true, true),
        (store_id_var, 'Pack de Templates Figma', 'pack-templates-figma-demo', 'Mais de 50 templates profissionais para acelerar seus projetos de design.', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop&crop=center', 'pack', 9900, 'published', true, false),
        (store_id_var, 'E-book: JavaScript Moderno', 'ebook-javascript-moderno-demo', 'Guia completo das funcionalidades mais recentes do JavaScript com exemplos práticos.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center', 'digital', 4900, 'published', true, false);
        
        -- Create member area config
        INSERT INTO public.member_area_configs (store_id, primary_color, secondary_color, welcome_message, show_other_products, show_progress_tracking, is_active)
        VALUES (
            store_id_var,
            '#3b82f6',
            '#6366f1', 
            'Bem-vindo à nossa área de membros! Aqui você encontra todos os seus cursos e materiais exclusivos.',
            true,
            true,
            true
        );
        
        -- Create sample exclusive content
        INSERT INTO public.member_exclusive_content (store_id, title, content_type, content, description, sort_order, is_active)
        VALUES 
        (store_id_var, 'Guia de Setup Completo', 'download', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'PDF com o passo a passo para configurar seu ambiente de desenvolvimento', 1, true),
        (store_id_var, 'Comunidade no Discord', 'link', 'https://discord.com', 'Acesse nossa comunidade exclusiva para tirar dúvidas e networking', 2, true);
    END IF;
END $$;