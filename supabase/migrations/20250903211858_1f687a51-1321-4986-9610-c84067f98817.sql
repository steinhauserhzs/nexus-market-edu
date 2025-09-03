-- Habilitar extensão de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar tabela de auditoria para acesso a dados financeiros
CREATE TABLE public.payment_info_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  accessed_user_id uuid, -- ID do usuário cujos dados foram acessados
  action text NOT NULL, -- 'read', 'insert', 'update', 'delete'
  ip_address inet,
  user_agent text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.payment_info_audit ENABLE ROW LEVEL SECURITY;

-- Política para auditoria - apenas administradores podem ver logs
CREATE POLICY "Only admins can view audit logs" 
ON public.payment_info_audit 
FOR SELECT 
USING (false); -- Por padrão, ninguém pode ver os logs diretamente

-- Função para criptografar dados sensíveis
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN data IS NULL OR data = '' THEN NULL
    ELSE encode(encrypt(data::bytea, 'financial_data_key_2024', 'aes'), 'base64')
  END;
$$;

-- Função para descriptografar dados sensíveis
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN encrypted_data IS NULL OR encrypted_data = '' THEN NULL
    ELSE convert_from(decrypt(decode(encrypted_data, 'base64'), 'financial_data_key_2024', 'aes'), 'UTF8')
  END;
$$;

-- Função de auditoria
CREATE OR REPLACE FUNCTION public.log_payment_info_access(
  accessed_user_id uuid,
  action_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_info_audit (
    user_id,
    accessed_user_id,
    action,
    timestamp
  ) VALUES (
    auth.uid(),
    accessed_user_id,
    action_type,
    now()
  );
END;
$$;

-- Adicionar colunas criptografadas
ALTER TABLE public.seller_payment_info 
ADD COLUMN encrypted_pix_key text,
ADD COLUMN encrypted_stripe_account_id text,
ADD COLUMN encrypted_bank_account text;

-- Migrar dados existentes para formato criptografado
UPDATE public.seller_payment_info 
SET 
  encrypted_pix_key = public.encrypt_sensitive_data(pix_key),
  encrypted_stripe_account_id = public.encrypt_sensitive_data(stripe_account_id),
  encrypted_bank_account = public.encrypt_sensitive_data(bank_account::text)
WHERE pix_key IS NOT NULL OR stripe_account_id IS NOT NULL OR bank_account IS NOT NULL;

-- Função segura para inserir informações de pagamento
CREATE OR REPLACE FUNCTION public.insert_payment_info(
  p_pix_key text DEFAULT NULL,
  p_stripe_account_id text DEFAULT NULL,
  p_bank_account jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Acesso negado: usuário não autenticado';
  END IF;

  -- Registrar ação de auditoria
  PERFORM public.log_payment_info_access(auth.uid(), 'insert');

  -- Inserir dados criptografados
  INSERT INTO public.seller_payment_info (
    user_id,
    encrypted_pix_key,
    encrypted_stripe_account_id,
    encrypted_bank_account,
    verified,
    created_at,
    updated_at
  ) VALUES (
    auth.uid(),
    public.encrypt_sensitive_data(p_pix_key),
    public.encrypt_sensitive_data(p_stripe_account_id),
    public.encrypt_sensitive_data(p_bank_account::text),
    false,
    now(),
    now()
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Função segura para atualizar informações de pagamento
CREATE OR REPLACE FUNCTION public.update_payment_info(
  p_pix_key text DEFAULT NULL,
  p_stripe_account_id text DEFAULT NULL,
  p_bank_account jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Acesso negado: usuário não autenticado';
  END IF;

  -- Registrar ação de auditoria
  PERFORM public.log_payment_info_access(auth.uid(), 'update');

  -- Atualizar dados criptografados
  UPDATE public.seller_payment_info 
  SET 
    encrypted_pix_key = CASE WHEN p_pix_key IS NOT NULL THEN public.encrypt_sensitive_data(p_pix_key) ELSE encrypted_pix_key END,
    encrypted_stripe_account_id = CASE WHEN p_stripe_account_id IS NOT NULL THEN public.encrypt_sensitive_data(p_stripe_account_id) ELSE encrypted_stripe_account_id END,
    encrypted_bank_account = CASE WHEN p_bank_account IS NOT NULL THEN public.encrypt_sensitive_data(p_bank_account::text) ELSE encrypted_bank_account END,
    updated_at = now()
  WHERE user_id = auth.uid();

  RETURN FOUND;
END;
$$;

-- Função segura para ler informações de pagamento
CREATE OR REPLACE FUNCTION public.get_payment_info()
RETURNS TABLE (
  id uuid,
  pix_key text,
  stripe_account_id text,
  bank_account jsonb,
  verified boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Acesso negado: usuário não autenticado';
  END IF;

  -- Registrar ação de auditoria
  PERFORM public.log_payment_info_access(auth.uid(), 'read');

  -- Retornar dados descriptografados
  RETURN QUERY
  SELECT 
    spi.id,
    public.decrypt_sensitive_data(spi.encrypted_pix_key) as pix_key,
    public.decrypt_sensitive_data(spi.encrypted_stripe_account_id) as stripe_account_id,
    CASE 
      WHEN spi.encrypted_bank_account IS NOT NULL 
      THEN public.decrypt_sensitive_data(spi.encrypted_bank_account)::jsonb 
      ELSE NULL 
    END as bank_account,
    spi.verified,
    spi.created_at,
    spi.updated_at
  FROM public.seller_payment_info spi
  WHERE spi.user_id = auth.uid();
END;
$$;

-- Remover políticas RLS antigas e criar novas mais restritivas
DROP POLICY IF EXISTS "Users can manage own payment info" ON public.seller_payment_info;

-- Nova política mais restritiva - bloquear acesso direto à tabela
CREATE POLICY "Block direct table access" 
ON public.seller_payment_info 
FOR ALL 
USING (false);

-- Remover dados não criptografados das colunas antigas (opcional - manter por compatibilidade)
-- Comentado para manter compatibilidade, mas recomenda-se remover após migração completa
-- UPDATE public.seller_payment_info SET pix_key = NULL, stripe_account_id = NULL, bank_account = NULL;

-- Criar índices para auditoria
CREATE INDEX idx_payment_info_audit_user_id ON public.payment_info_audit(user_id);
CREATE INDEX idx_payment_info_audit_timestamp ON public.payment_info_audit(timestamp);
CREATE INDEX idx_payment_info_audit_action ON public.payment_info_audit(action);