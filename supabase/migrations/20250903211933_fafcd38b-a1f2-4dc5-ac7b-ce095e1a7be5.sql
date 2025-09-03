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
USING (false);

-- Função para criptografar dados sensíveis usando pgp_sym_encrypt
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN data IS NULL OR data = '' THEN NULL
    ELSE encode(pgp_sym_encrypt(data, 'financial_data_encryption_key_2024'), 'base64')
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
    ELSE pgp_sym_decrypt(decode(encrypted_data, 'base64'), 'financial_data_encryption_key_2024')
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

-- Adicionar colunas criptografadas à tabela existente
ALTER TABLE public.seller_payment_info 
ADD COLUMN IF NOT EXISTS encrypted_pix_key text,
ADD COLUMN IF NOT EXISTS encrypted_stripe_account_id text,
ADD COLUMN IF NOT EXISTS encrypted_bank_account text;