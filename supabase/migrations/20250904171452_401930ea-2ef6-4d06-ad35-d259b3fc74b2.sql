-- Corrigir inserção de templates (sem store_id específico)
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
}', true),

-- Template: Hero Minimalista
('Hero Minimalista', 'hero', '{
  "height": "400px",
  "background": "solid",
  "backgroundColor": "#f8f9fa",
  "textAlign": "left",
  "showCTA": false,
  "overlay": "0",
  "padding": "large"
}', true),

-- Template: Grid Compacto
('Grid Compacto', 'product_grid', '{
  "columns": 6,
  "cardStyle": "minimal",
  "showFilters": false,
  "imageAspect": "portrait",
  "hoverEffect": "none",
  "spacing": "tight"
}', true);

-- Atualizar política RLS para permitir templates sem store_id
DROP POLICY IF EXISTS "Store owners can manage their store components" ON public.store_components;
CREATE POLICY "Store owners can manage their store components"
ON public.store_components
FOR ALL
USING (
  store_id IS NULL AND is_template = true OR
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = store_components.store_id 
    AND stores.owner_id = auth.uid()
  )
);