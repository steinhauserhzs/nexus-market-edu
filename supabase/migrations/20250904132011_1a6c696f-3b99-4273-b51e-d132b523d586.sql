-- Correção dos warnings de segurança detectados pelo linter

-- 1. Corrigir funções sem search_path definido
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cpf_numbers TEXT;
    sum1 INTEGER := 0;
    sum2 INTEGER := 0;
    digit1 INTEGER;
    digit2 INTEGER;
    i INTEGER;
BEGIN
    -- Remove formatação e mantém apenas números
    cpf_numbers := regexp_replace(cpf_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 11 dígitos
    IF length(cpf_numbers) != 11 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica sequências inválidas (todos iguais)
    IF cpf_numbers IN ('00000000000', '11111111111', '22222222222', '33333333333', 
                       '44444444444', '55555555555', '66666666666', '77777777777',
                       '88888888888', '99999999999') THEN
        RETURN FALSE;
    END IF;
    
    -- Calcula primeiro dígito verificador
    FOR i IN 1..9 LOOP
        sum1 := sum1 + (substring(cpf_numbers from i for 1)::INTEGER * (11 - i));
    END LOOP;
    
    digit1 := 11 - (sum1 % 11);
    IF digit1 >= 10 THEN
        digit1 := 0;
    END IF;
    
    -- Calcula segundo dígito verificador
    FOR i IN 1..10 LOOP
        sum2 := sum2 + (substring(cpf_numbers from i for 1)::INTEGER * (12 - i));
    END LOOP;
    
    digit2 := 11 - (sum2 % 11);
    IF digit2 >= 10 THEN
        digit2 := 0;
    END IF;
    
    -- Verifica se os dígitos calculados coincidem com os informados
    RETURN (substring(cpf_numbers from 10 for 1)::INTEGER = digit1 AND
            substring(cpf_numbers from 11 for 1)::INTEGER = digit2);
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_phone_br(phone_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    phone_numbers TEXT;
BEGIN
    -- Remove formatação e mantém apenas números
    phone_numbers := regexp_replace(phone_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 10 ou 11 dígitos (com DDD)
    IF length(phone_numbers) NOT IN (10, 11) THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica se o DDD é válido (11 a 99)
    IF substring(phone_numbers from 1 for 2)::INTEGER < 11 OR 
       substring(phone_numbers from 1 for 2)::INTEGER > 99 THEN
        RETURN FALSE;
    END IF;
    
    -- Para celular (11 dígitos), verifica se começa com 9
    IF length(phone_numbers) = 11 THEN
        IF substring(phone_numbers from 3 for 1) != '9' THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validar CPF se fornecido
    IF NEW.cpf IS NOT NULL AND NEW.cpf != '' THEN
        IF NOT public.validate_cpf(NEW.cpf) THEN
            RAISE EXCEPTION 'CPF inválido: %', NEW.cpf;
        END IF;
    END IF;
    
    -- Validar telefone se fornecido
    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
        IF NOT public.validate_phone_br(NEW.phone) THEN
            RAISE EXCEPTION 'Telefone inválido: %', NEW.phone;
        END IF;
    END IF;
    
    -- Normalizar email para minúsculas
    IF NEW.email IS NOT NULL THEN
        NEW.email := lower(trim(NEW.email));
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_security_event(
    p_action TEXT,
    p_details JSONB DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_logs (user_id, action, details)
    VALUES (
        COALESCE(p_user_id, auth.uid()),
        p_action,
        p_details
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- 2. Comentários de documentação para auditoria
COMMENT ON FUNCTION public.validate_cpf IS 'Validação segura de CPF brasileiro com algoritmo oficial - SET search_path = public para segurança';
COMMENT ON FUNCTION public.validate_phone_br IS 'Validação segura de telefone brasileiro - SET search_path = public para segurança';
COMMENT ON FUNCTION public.validate_profile_data IS 'Trigger de validação de dados do perfil - SET search_path = public para segurança';
COMMENT ON FUNCTION public.log_security_event IS 'Função de log de eventos de segurança - SET search_path = public para segurança';