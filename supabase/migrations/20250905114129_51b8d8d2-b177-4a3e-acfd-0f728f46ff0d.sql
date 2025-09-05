-- Corrigir todas as funções que não têm search_path definido
-- Estas são funções de segurança críticas que foram identificadas pelo linter

-- 1. Corrigir funções de auditoria de dados sensíveis
ALTER FUNCTION log_sensitive_data_access(text, text, text, text) SET search_path = 'public';
ALTER FUNCTION log_financial_access() SET search_path = 'public';

-- 2. Corrigir funções de consentimento do usuário  
ALTER FUNCTION update_user_consent(boolean, boolean, boolean) SET search_path = 'public';

-- 3. Corrigir função de exportação de dados do usuário
ALTER FUNCTION export_user_data() SET search_path = 'public';