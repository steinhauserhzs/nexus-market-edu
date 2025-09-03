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

  -- Verificar se já existe informação para este usuário
  IF EXISTS (SELECT 1 FROM public.seller_payment_info WHERE user_id = current_user_id) THEN
    PERFORM public.log_payment_info_access(current_user_id, 'insert', false, 'Informação já existe');
    RAISE EXCEPTION 'DUPLICADO: Informação de pagamento já existe';
  END IF;

  -- Validar PIX key se fornecida
  IF p_pix_key IS NOT NULL AND length(trim(p_pix_key)) < 11 THEN
    PERFORM public.log_payment_info_access(current_user_id, 'insert', false, 'PIX key inválida');
    RAISE EXCEPTION 'DADOS_INVALIDOS: PIX key deve ter pelo menos 11 caracteres';
  END IF;

  -- Registrar acesso
  PERFORM public.log_payment_info_access(current_user_id, 'insert', true, NULL);

  -- Inserir dados
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

  -- Registrar acesso
  PERFORM public.log_payment_info_access(current_user_id, 'update', true, NULL);

  -- Atualizar dados apenas se fornecidos
  UPDATE public.seller_payment_info 
  SET 
    pix_key = CASE WHEN p_pix_key IS NOT NULL THEN p_pix_key ELSE pix_key END,
    stripe_account_id = CASE WHEN p_stripe_account_id IS NOT NULL THEN p_stripe_account_id ELSE stripe_account_id END,
    bank_account = CASE WHEN p_bank_account IS NOT NULL THEN p_bank_account ELSE bank_account END,
    updated_at = now(),
    verified = false -- Reset verificação quando dados mudam
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

  -- Registrar acesso (só registra se conseguir acessar)
  PERFORM public.log_payment_info_access(current_user_id, 'read', true, NULL);

  -- Retornar dados apenas do usuário atual
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

-- Função para ver logs de auditoria (próprios dados apenas)
CREATE OR REPLACE FUNCTION public.get_my_payment_audit_logs(
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  action text,
  success boolean,
  error_message text,
  audit_timestamp timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Usuário não autenticado';
  END IF;

  RETURN QUERY
  SELECT 
    pia.id,
    pia.action,
    pia.success,
    pia.error_message,
    pia.audit_timestamp
  FROM public.payment_info_audit pia
  WHERE 
    pia.accessed_user_id = current_user_id
    AND (start_date IS NULL OR pia.audit_timestamp >= start_date)
    AND (end_date IS NULL OR pia.audit_timestamp <= end_date)
  ORDER BY pia.audit_timestamp DESC
  LIMIT 50;
END;
$$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_info_audit_user_id ON public.payment_info_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_info_audit_accessed_user ON public.payment_info_audit(accessed_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_info_audit_timestamp ON public.payment_info_audit(audit_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_payment_info_audit_action ON public.payment_info_audit(action);
CREATE INDEX IF NOT EXISTS idx_seller_payment_info_user_id ON public.seller_payment_info(user_id);