-- Expandir tabela de perfis com mais informações pessoais
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profession VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Endereço
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Brasil';

-- Preferências e configurações
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'pt-BR';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT true;

-- Campos de segurança e verificação
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_method VARCHAR(20) DEFAULT 'email';

-- Índices para busca e performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);

-- Função para validar CPF (formato básico)
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove caracteres não numéricos
  cpf_input := regexp_replace(cpf_input, '[^0-9]', '', 'g');
  
  -- Verifica se tem 11 dígitos
  IF length(cpf_input) != 11 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se não são todos os dígitos iguais
  IF cpf_input IN ('00000000000', '11111111111', '22222222222', '33333333333', 
                   '44444444444', '55555555555', '66666666666', '77777777777',
                   '88888888888', '99999999999') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Função para validar telefone brasileiro
CREATE OR REPLACE FUNCTION public.validate_phone(phone_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove caracteres não numéricos
  phone_input := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Verifica se tem entre 10 e 11 dígitos (formato brasileiro)
  IF length(phone_input) NOT IN (10, 11) THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se começa com código de área válido (11-99)
  IF substring(phone_input, 1, 2)::int < 11 OR substring(phone_input, 1, 2)::int > 99 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Trigger para atualizar last_login_at quando necessário
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualiza last_login_at se o usuário estava offline por mais de 1 hora
  IF OLD.last_login_at IS NULL OR (NOW() - OLD.last_login_at) > INTERVAL '1 hour' THEN
    NEW.last_login_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar last_login_at
DROP TRIGGER IF EXISTS update_profiles_last_login ON public.profiles;
CREATE TRIGGER update_profiles_last_login
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_login();

-- Política RLS atualizada para permitir busca por CPF e telefone
CREATE POLICY IF NOT EXISTS "Users can find profiles by CPF or phone for auth" 
ON public.profiles 
FOR SELECT 
USING (
  -- Permite que o próprio usuário veja seu perfil
  auth.uid() = id 
  OR 
  -- Permite busca por CPF/telefone apenas se autenticado (para login)
  (auth.uid() IS NOT NULL AND (cpf IS NOT NULL OR phone IS NOT NULL))
);