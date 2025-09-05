-- Promover usuários atuais para administradores
UPDATE public.profiles 
SET role = 'admin', updated_at = now() 
WHERE email IN ('steinhauser.haira@gmail.com', 'sousa.mds93@gmail.com');

-- Criar tabela para controle de permissões administrativas
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL,
  resource TEXT,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT true,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_permissions
CREATE POLICY "Only admins can manage permissions" 
ON public.admin_permissions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

-- Criar tabela para logs administrativos
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_logs
CREATE POLICY "Only admins can view logs" 
ON public.admin_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

CREATE POLICY "System can insert logs" 
ON public.admin_logs 
FOR INSERT 
WITH CHECK (true);

-- Criar tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS public.system_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- Políticas para system_configs
CREATE POLICY "Only admins can manage configs" 
ON public.system_configs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

-- Inserir configurações padrão do sistema
INSERT INTO public.system_configs (config_key, config_value, description) VALUES
('platform_fee_percentage', '5', 'Taxa da plataforma em porcentagem'),
('platform_fixed_fee_cents', '39', 'Taxa fixa da plataforma em centavos'),
('max_commission_percentage', '50', 'Porcentagem máxima de comissão para afiliados'),
('auto_approve_products', 'false', 'Aprovar produtos automaticamente'),
('require_kyc_verification', 'true', 'Requer verificação KYC'),
('maintenance_mode', 'false', 'Modo de manutenção')
ON CONFLICT (config_key) DO NOTHING;

-- Função para log automático de ações administrativas
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só registra se for admin
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    INSERT INTO public.admin_logs (
      admin_id,
      action,
      target_type,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      p_action,
      p_target_type,
      p_target_id,
      p_details
    );
  END IF;
END;
$$;

-- Função para obter configuração do sistema
CREATE OR REPLACE FUNCTION public.get_system_config(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_value JSONB;
BEGIN
  SELECT sc.config_value INTO config_value
  FROM public.system_configs sc
  WHERE sc.config_key = p_key;
  
  RETURN COALESCE(config_value, 'null'::jsonb);
END;
$$;