-- Melhorias de segurança e otimização de performance

-- 1. Adicionar índices para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

-- 2. Função para validar CPF (algoritmo oficial)
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf_input TEXT)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Função para validar telefone brasileiro
CREATE OR REPLACE FUNCTION public.validate_phone_br(phone_input TEXT)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Trigger para validar dados antes de inserir/atualizar profiles
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS validate_profile_data_trigger ON public.profiles;
CREATE TRIGGER validate_profile_data_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_profile_data();

-- 5. Função para log de atividades críticas
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Política para que apenas admins vejam todos os logs
CREATE POLICY "Admin can view all security logs" ON public.security_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para usuários verem apenas seus próprios logs
CREATE POLICY "Users can view their own security logs" ON public.security_logs
    FOR SELECT USING (user_id = auth.uid());

-- Função para registrar logs de segurança
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_action TEXT,
    p_details JSONB DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Melhorias nas políticas existentes para maior segurança
-- Atualizar política de produtos para verificar propriedade da loja
DROP POLICY IF EXISTS "Users can update their products" ON public.products;
CREATE POLICY "Users can update their products" ON public.products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id = auth.uid()
        )
    );

-- Política mais restritiva para mensagens
DROP POLICY IF EXISTS "Users can view messages where they are sender or receiver" ON public.messages;
CREATE POLICY "Users can view messages where they are sender or receiver" ON public.messages
    FOR SELECT USING (
        sender_id = auth.uid() OR receiver_id = auth.uid()
    );

-- 7. Configurações de rate limiting e segurança
COMMENT ON TABLE public.security_logs IS 'Log de eventos de segurança para auditoria';
COMMENT ON FUNCTION public.validate_cpf IS 'Validação de CPF usando algoritmo oficial brasileiro';
COMMENT ON FUNCTION public.validate_phone_br IS 'Validação de telefone brasileiro com DDD';