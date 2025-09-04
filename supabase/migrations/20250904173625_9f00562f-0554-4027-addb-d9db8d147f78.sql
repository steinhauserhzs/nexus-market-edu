-- Remove constraint restritivo de difficulty_level
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_difficulty_level_check;

-- Adiciona constraint mais flexível (permite null e valores específicos)
ALTER TABLE public.products ADD CONSTRAINT products_difficulty_level_check 
CHECK (difficulty_level IS NULL OR difficulty_level IN ('iniciante', 'intermediario', 'avancado', 'beginner', 'intermediate', 'advanced', ''));

-- Criar tabela para gerenciar uploads de arquivos em progresso
CREATE TABLE IF NOT EXISTS public.upload_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  store_id UUID REFERENCES stores(id),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  chunks_total INTEGER NOT NULL,
  chunks_uploaded INTEGER DEFAULT 0,
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'completed', 'failed')),
  final_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para upload_sessions
ALTER TABLE public.upload_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own upload sessions" 
ON public.upload_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- Função para limpeza automática de sessões antigas
CREATE OR REPLACE FUNCTION cleanup_old_upload_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.upload_sessions 
  WHERE created_at < (now() - INTERVAL '24 hours') 
  AND status != 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_upload_sessions_updated_at
  BEFORE UPDATE ON public.upload_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();