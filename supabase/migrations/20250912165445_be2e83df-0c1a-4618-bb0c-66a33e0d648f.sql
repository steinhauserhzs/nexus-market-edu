-- Verificar se já existem produtos para evitar duplicatas
DO $$
BEGIN
  -- Só criar produtos se não existirem ainda
  IF NOT EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.stores s ON s.id = p.store_id
    WHERE s.slug = 'nexus-criminal' AND p.title = 'Curso de Direito Criminal Avançado'
  ) THEN

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

  END IF;

  -- FASE 2: Configurar área de membros para a loja (só se não existir)
  IF NOT EXISTS (
    SELECT 1 FROM public.member_area_configs mac
    JOIN public.stores s ON s.id = mac.store_id
    WHERE s.slug = 'nexus-criminal'
  ) THEN

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

  END IF;

END $$;