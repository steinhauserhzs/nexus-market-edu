-- Alterar store_components para permitir store_id nulo (para templates)
ALTER TABLE public.store_components ALTER COLUMN store_id DROP NOT NULL;

-- Inserir templates padrão agora que store_id pode ser NULL
INSERT INTO public.store_components (name, type, config, is_template) VALUES
-- Template: Header Moderno
('Header Moderno', 'header', '{
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
('Hero Gradiente', 'hero', '{
  "height": "500px",
  "background": "gradient",
  "textAlign": "center",
  "showCTA": true,
  "ctaText": "Conheça nossos produtos",
  "overlay": "0.3",
  "animation": "fade-in"
}', true),

-- Template: Grid de Produtos Moderno
('Grid Moderno', 'product_grid', '{
  "columns": 4,
  "cardStyle": "modern",
  "showFilters": true,
  "imageAspect": "square",
  "hoverEffect": "lift",
  "showQuickView": true
}', true),

-- Template: Footer Completo
('Footer Completo', 'footer', '{
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
}', true);