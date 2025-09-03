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