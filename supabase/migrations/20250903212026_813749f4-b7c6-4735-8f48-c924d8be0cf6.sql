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

-- Função para gerar chave de criptografia consistente
CREATE OR REPLACE FUNCTION public.get_encryption_key()
RETURNS bytea
LANGUAGE sql
SECURITY DEFINER
IMMUTABLE
AS $$
  SELECT digest('financial_data_key_2024_nexus_secure', 'sha256');
$$;

-- Função para criptografar dados sensíveis usando pgp_sym_encrypt
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN data IS NULL OR data = '' THEN NULL
    ELSE encode(pgp_sym_encrypt(data, 'nexus_financial_2024_key'), 'base64')
  END;
$$;

-- Função para descriptografar dados sensíveis usando pgp_sym_decrypt
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN encrypted_data IS NULL OR encrypted_data = '' THEN NULL
    ELSE pgp_sym_decrypt(decode(encrypted_data, 'base64'), 'nexus_financial_2024_key')
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
EXCEPTION WHEN OTHERS THEN
  -- Falhar silenciosamente para não quebrar operações principais
  NULL;
END;
$$;

-- Adicionar colunas criptografadas
ALTER TABLE public.seller_payment_info 
ADD COLUMN IF NOT EXISTS encrypted_pix_key text,
ADD COLUMN IF NOT EXISTS encrypted_stripe_account_id text,
ADD COLUMN IF NOT EXISTS encrypted_bank_account text;

-- Migrar dados existentes para formato criptografado (se existirem)
UPDATE public.seller_payment_info 
SET 
  encrypted_pix_key = public.encrypt_sensitive_data(pix_key),
  encrypted_stripe_account_id = public.encrypt_sensitive_data(stripe_account_id),
  encrypted_bank_account = public.encrypt_sensitive_data(bank_account::text)
WHERE (encrypted_pix_key IS NULL AND pix_key IS NOT NULL) 
   OR (encrypted_stripe_account_id IS NULL AND stripe_account_id IS NOT NULL) 
   OR (encrypted_bank_account IS NULL AND bank_account IS NOT NULL);

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
    COALESCE(public.decrypt_sensitive_data(spi.encrypted_pix_key), spi.pix_key) as pix_key,
    COALESCE(public.decrypt_sensitive_data(spi.encrypted_stripe_account_id), spi.stripe_account_id) as stripe_account_id,
    CASE 
      WHEN spi.encrypted_bank_account IS NOT NULL 
      THEN public.decrypt_sensitive_data(spi.encrypted_bank_account)::jsonb 
      ELSE spi.bank_account 
    END as bank_account,
    spi.verified,
    spi.created_at,
    spi.updated_at
  FROM public.seller_payment_info spi
  WHERE spi.user_id = auth.uid();
END;
$$;

-- Criar índices para auditoria
CREATE INDEX IF NOT EXISTS idx_payment_info_audit_user_id ON public.payment_info_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_info_audit_timestamp ON public.payment_info_audit(timestamp);
CREATE INDEX IF NOT EXISTS idx_payment_info_audit_action ON public.payment_info_audit(action);