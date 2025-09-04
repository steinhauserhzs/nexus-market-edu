-- Inserir templates padrão de componentes de loja
INSERT INTO public.store_components (store_id, name, type, config, is_template) VALUES
-- Template: Header Moderno
(gen_random_uuid(), 'Header Moderno', 'header', '{
  "layout": "centered",
  "height": "4rem",
  "background": "transparent",
  "logoPosition": "left",
  "menuStyle": "horizontal",
  "showSearch": true,
  "showCart": true,
  "sticky": true
}', true),

-- Template: Hero com Gradiente
(gen_random_uuid(), 'Hero Gradiente', 'hero', '{
  "height": "500px",
  "background": "gradient",
  "textAlign": "center",
  "showCTA": true,
  "ctaText": "Conheça nossos produtos",
  "overlay": "0.3",
  "animation": "fade-in"
}', true),

-- Template: Grid de Produtos Moderno
(gen_random_uuid(), 'Grid Moderno', 'product_grid', '{
  "columns": 4,
  "cardStyle": "modern",
  "showFilters": true,
  "imageAspect": "square",
  "hoverEffect": "lift",
  "showQuickView": true
}', true),

-- Template: Footer Completo
(gen_random_uuid(), 'Footer Completo', 'footer', '{
  "background": "#1f2937",
  "textColor": "#ffffff",
  "showLogo": true,
  "showSocial": true,
  "showNewsletter": true,
  "columns": 4,
  "links": [
    {"title": "Sobre", "url": "/sobre"},
    {"title": "Contato", "url": "/contato"},
    {"title": "Política de Privacidade", "url": "/privacidade"}
  ]
}', true),

-- Template: Hero Minimalista
(gen_random_uuid(), 'Hero Minimalista', 'hero', '{
  "height": "400px",
  "background": "solid",
  "backgroundColor": "#f8f9fa",
  "textAlign": "left",
  "showCTA": false,
  "overlay": "0",
  "padding": "large"
}', true),

-- Template: Grid Compacto
(gen_random_uuid(), 'Grid Compacto', 'product_grid', '{
  "columns": 6,
  "cardStyle": "minimal",
  "showFilters": false,
  "imageAspect": "portrait",
  "hoverEffect": "none",
  "spacing": "tight"
}', true);