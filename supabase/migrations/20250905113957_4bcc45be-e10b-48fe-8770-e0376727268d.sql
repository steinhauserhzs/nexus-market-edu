-- Criar tabela para configurações da área de membros por loja
CREATE TABLE public.member_area_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  -- Configurações visuais
  custom_logo_url TEXT,
  primary_color TEXT DEFAULT '#dc2626',
  secondary_color TEXT DEFAULT '#1f2937',
  welcome_message TEXT,
  
  -- Conteúdo personalizado
  welcome_video_url TEXT,
  exclusive_content JSONB DEFAULT '[]'::jsonb,
  member_resources JSONB DEFAULT '[]'::jsonb,
  
  -- Configurações gerais
  is_active BOOLEAN DEFAULT true,
  show_other_products BOOLEAN DEFAULT true,
  show_progress_tracking BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(store_id)
);

-- Habilitar RLS
ALTER TABLE public.member_area_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Store owners can manage their member area configs"
ON public.member_area_configs
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.stores s
  WHERE s.id = member_area_configs.store_id 
  AND s.owner_id = auth.uid()
));

CREATE POLICY "Members can view member area configs"
ON public.member_area_configs
FOR SELECT
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM public.licenses l
    JOIN public.products p ON p.id = l.product_id
    WHERE p.store_id = member_area_configs.store_id
    AND l.user_id = auth.uid()
    AND l.is_active = true
  )
);

-- Criar tabela para conteúdo exclusivo da área de membros
CREATE TABLE public.member_exclusive_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'download', 'link')),
  content TEXT NOT NULL,
  description TEXT,
  
  -- Controle de acesso
  requires_product_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.member_exclusive_content ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Store owners can manage their exclusive content"
ON public.member_exclusive_content
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.stores s
  WHERE s.id = member_exclusive_content.store_id 
  AND s.owner_id = auth.uid()
));

CREATE POLICY "Members can view exclusive content"
ON public.member_exclusive_content
FOR SELECT
USING (
  is_active = true 
  AND (
    -- Se não há produtos específicos exigidos, qualquer membro pode ver
    requires_product_ids = '{}' 
    OR 
    -- Se há produtos específicos, verificar se o usuário tem licença para pelo menos um
    EXISTS (
      SELECT 1 FROM public.licenses l
      WHERE l.user_id = auth.uid()
      AND l.is_active = true
      AND l.product_id = ANY(requires_product_ids)
    )
  )
  AND EXISTS (
    -- Verificar se é membro da loja (tem pelo menos uma licença)
    SELECT 1 FROM public.licenses l
    JOIN public.products p ON p.id = l.product_id
    WHERE p.store_id = member_exclusive_content.store_id
    AND l.user_id = auth.uid()
    AND l.is_active = true
  )
);

-- Trigger para atualização automática de updated_at
CREATE OR REPLACE FUNCTION update_member_area_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_member_area_configs_updated_at
  BEFORE UPDATE ON public.member_area_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_member_area_updated_at();

CREATE TRIGGER update_member_exclusive_content_updated_at
  BEFORE UPDATE ON public.member_exclusive_content
  FOR EACH ROW
  EXECUTE FUNCTION update_member_area_updated_at();