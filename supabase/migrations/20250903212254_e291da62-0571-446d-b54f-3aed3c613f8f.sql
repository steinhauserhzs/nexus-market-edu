-- Criar tabela de auditoria para acesso a dados financeiros
CREATE TABLE public.payment_info_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  accessed_user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('read', 'insert', 'update', 'delete')),
  ip_address inet,
  user_agent text,
  session_id text,
  success boolean DEFAULT true,
  error_message text,
  audit_timestamp timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.payment_info_audit ENABLE ROW LEVEL SECURITY;

-- Políticas restritivas para auditoria
CREATE POLICY "System only audit logging" 
ON public.payment_info_audit 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "No direct access to audit logs" 
ON public.payment_info_audit 
FOR SELECT 
USING (false);

-- Função de auditoria
CREATE OR REPLACE FUNCTION public.log_payment_info_access(
  accessed_user_id uuid,
  action_type text,
  success_status boolean DEFAULT true,
  error_msg text DEFAULT NULL
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
    success,
    error_message,
    audit_timestamp
  ) VALUES (
    auth.uid(),
    accessed_user_id,
    action_type,
    success_status,
    error_msg,
    now()
  );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Silenciar erros de auditoria
END;
$$;

-- Função para verificar acesso
CREATE OR REPLACE FUNCTION public.can_access_payment_info(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL AND auth.uid() = target_user_id;
END;
$$;

-- Remover política RLS anterior
DROP POLICY IF EXISTS "Users can manage own payment info" ON public.seller_payment_info;

-- Política que bloqueia acesso direto à tabela
CREATE POLICY "No direct access to payment info" 
ON public.seller_payment_info 
FOR ALL 
USING (false) 
WITH CHECK (false);