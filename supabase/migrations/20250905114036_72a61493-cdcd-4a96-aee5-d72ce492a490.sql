-- Corrigir funções sem search_path definido
ALTER FUNCTION update_member_area_updated_at() SET search_path = 'public';

-- Verificar e habilitar RLS em tabelas necessárias
-- Primeiro vamos verificar se a tabela data_retention_policies precisa de RLS
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir apenas admins gerenciarem políticas de retenção
CREATE POLICY "Only admins can manage data retention policies"
ON public.data_retention_policies
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));