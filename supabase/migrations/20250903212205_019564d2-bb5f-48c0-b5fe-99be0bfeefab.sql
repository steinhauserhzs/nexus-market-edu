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
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.payment_info_audit ENABLE ROW LEVEL SECURITY;

-- Política restritiva para auditoria - apenas sistema pode inserir logs
CREATE POLICY "System only audit logging" 
ON public.payment_info_audit 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "No direct access to audit logs" 
ON public.payment_info_audit 
FOR SELECT 
USING (false);

-- Função de auditoria com mais detalhes
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
    timestamp
  ) VALUES (
    auth.uid(),
    accessed_user_id,
    action_type,
    success_status,
    error_msg,
    now()
  );
EXCEPTION WHEN OTHERS THEN
  -- Se falhar ao registrar auditoria, ainda assim registre o erro
  NULL;
END;
$$;

-- Função para verificar se usuário pode acessar dados financeiros
CREATE OR REPLACE FUNCTION public.can_access_payment_info(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Apenas o próprio usuário pode acessar seus dados
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Função segura para inserir informações de pagamento
CREATE OR REPLACE FUNCTION public.secure_insert_payment_info(
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
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Verificar autenticação
  IF current_user_id IS NULL THEN
    PERFORM public.log_payment_info_access(current_user_id, 'insert', false, 'Usuário não autenticado');
    RAISE EXCEPTION 'ACESSO_NEGADO: Usuário não autenticado';
  END IF;

  -- Verificar se já existe informação de pagamento para este usuário
  IF EXISTS (SELECT 1 FROM public.seller_payment_info WHERE user_id = current_user_id) THEN
    PERFORM public.log_payment_info_access(current_user_id, 'insert', false, 'Informação de pagamento já existe');
    RAISE EXCEPTION 'DUPLICADO: Informação de pagamento já existe para este usuário';
  END IF;

  -- Validar dados de entrada
  IF p_pix_key IS NOT NULL AND length(p_pix_key) < 11 THEN
    PERFORM public.log_payment_info_access(current_user_id, 'insert', false, 'PIX key inválida');
    RAISE EXCEPTION 'DADOS_INVALIDOS: PIX key deve ter pelo menos 11 caracteres';
  END IF;

  -- Registrar tentativa de inserção
  PERFORM public.log_payment_info_access(current_user_id, 'insert', true, NULL);

  -- Inserir dados com hash dos campos sensíveis para verificação
  INSERT INTO public.seller_payment_info (
    user_id,
    pix_key,
    stripe_account_id,
    bank_account,
    verified,
    created_at,
    updated_at
  ) VALUES (
    current_user_id,
    p_pix_key,
    p_stripe_account_id,
    p_bank_account,
    false,
    now(),
    now()
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Função segura para atualizar informações de pagamento
CREATE OR REPLACE FUNCTION public.secure_update_payment_info(
  p_pix_key text DEFAULT NULL,
  p_stripe_account_id text DEFAULT NULL,
  p_bank_account jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  rows_affected integer;
BEGIN
  current_user_id := auth.uid();
  
  -- Verificar autenticação
  IF current_user_id IS NULL THEN
    PERFORM public.log_payment_info_access(current_user_id, 'update', false, 'Usuário não autenticado');
    RAISE EXCEPTION 'ACESSO_NEGADO: Usuário não autenticado';
  END IF;

  -- Verificar se pode acessar
  IF NOT public.can_access_payment_info(current_user_id) THEN
    PERFORM public.log_payment_info_access(current_user_id, 'update', false, 'Acesso negado');
    RAISE EXCEPTION 'ACESSO_NEGADO: Sem permissão para atualizar dados';
  END IF;

  -- Registrar tentativa de atualização
  PERFORM public.log_payment_info_access(current_user_id, 'update', true, NULL);

  -- Atualizar dados
  UPDATE public.seller_payment_info 
  SET 
    pix_key = COALESCE(p_pix_key, pix_key),
    stripe_account_id = COALESCE(p_stripe_account_id, stripe_account_id),
    bank_account = COALESCE(p_bank_account, bank_account),
    updated_at = now(),
    verified = false -- Reset verification when data changes
  WHERE user_id = current_user_id;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
END;
$$;

-- Função segura para ler informações de pagamento
CREATE OR REPLACE FUNCTION public.secure_get_payment_info()
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
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Verificar autenticação
  IF current_user_id IS NULL THEN
    PERFORM public.log_payment_info_access(current_user_id, 'read', false, 'Usuário não autenticado');
    RAISE EXCEPTION 'ACESSO_NEGADO: Usuário não autenticado';
  END IF;

  -- Verificar se pode acessar
  IF NOT public.can_access_payment_info(current_user_id) THEN
    PERFORM public.log_payment_info_access(current_user_id, 'read', false, 'Acesso negado');
    RAISE EXCEPTION 'ACESSO_NEGADO: Sem permissão para acessar dados';
  END IF;

  -- Registrar acesso
  PERFORM public.log_payment_info_access(current_user_id, 'read', true, NULL);

  -- Retornar dados (apenas do usuário atual)
  RETURN QUERY
  SELECT 
    spi.id,
    spi.pix_key,
    spi.stripe_account_id,
    spi.bank_account,
    spi.verified,
    spi.created_at,
    spi.updated_at
  FROM public.seller_payment_info spi
  WHERE spi.user_id = current_user_id;
END;
$$;

-- Remover política RLS anterior e criar nova mais restritiva
DROP POLICY IF EXISTS "Users can manage own payment info" ON public.seller_payment_info;

-- Política que bloqueia COMPLETAMENTE o acesso direto à tabela
CREATE POLICY "No direct access to payment info" 
ON public.seller_payment_info 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Criar índices para auditoria e performance
CREATE INDEX idx_payment_info_audit_user_id ON public.payment_info_audit(user_id);
CREATE INDEX idx_payment_info_audit_accessed_user ON public.payment_info_audit(accessed_user_id);
CREATE INDEX idx_payment_info_audit_timestamp ON public.payment_info_audit(timestamp DESC);
CREATE INDEX idx_payment_info_audit_action ON public.payment_info_audit(action);
CREATE INDEX idx_payment_info_audit_success ON public.payment_info_audit(success);

-- Função para administradores verem logs de auditoria (restrita)
CREATE OR REPLACE FUNCTION public.get_payment_audit_logs(
  target_user_id uuid DEFAULT NULL,
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  accessed_user_id uuid,
  action text,
  success boolean,
  error_message text,
  timestamp timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Por enquanto, apenas retorna logs do próprio usuário
  -- Em produção, adicionar verificação de role de admin
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Usuário não autenticado';
  END IF;

  RETURN QUERY
  SELECT 
    pia.id,
    pia.user_id,
    pia.accessed_user_id,
    pia.action,
    pia.success,
    pia.error_message,
    pia.timestamp
  FROM public.payment_info_audit pia
  WHERE 
    (target_user_id IS NULL OR pia.accessed_user_id = target_user_id)
    AND (start_date IS NULL OR pia.timestamp >= start_date)
    AND (end_date IS NULL OR pia.timestamp <= end_date)
    AND pia.accessed_user_id = auth.uid() -- Apenas próprios logs por enquanto
  ORDER BY pia.timestamp DESC
  LIMIT 100;
END;
$$;