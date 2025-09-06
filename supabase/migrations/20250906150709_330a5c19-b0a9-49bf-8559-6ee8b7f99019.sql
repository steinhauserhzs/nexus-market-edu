-- Adicionar coluna is_active na tabela products para filtros
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Garantir que produtos existentes tenham status published quando apropriado
UPDATE public.products 
SET status = 'published' 
WHERE status IS NULL OR status NOT IN ('draft', 'published', 'archived');

-- Atualizar produtos existentes para serem ativos por padrão
UPDATE public.products 
SET is_active = true 
WHERE is_active IS NULL;