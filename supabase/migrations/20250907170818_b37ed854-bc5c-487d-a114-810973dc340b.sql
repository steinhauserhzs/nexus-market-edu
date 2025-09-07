-- Criar tabela de seguidores de loja
CREATE TABLE public.store_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, store_id)
);

-- Habilitar RLS
ALTER TABLE public.store_followers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can follow stores" 
ON public.store_followers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow stores" 
ON public.store_followers 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own follows" 
ON public.store_followers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Store owners can view their followers" 
ON public.store_followers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM stores s 
  WHERE s.id = store_followers.store_id 
  AND s.owner_id = auth.uid()
));

-- Criar função para contar seguidores
CREATE OR REPLACE FUNCTION public.get_store_followers_count(store_id uuid)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.store_followers 
    WHERE store_followers.store_id = get_store_followers_count.store_id
  );
END;
$$;

-- Criar função para verificar se usuário segue loja
CREATE OR REPLACE FUNCTION public.user_follows_store(store_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.store_followers 
    WHERE user_id = auth.uid() 
    AND store_followers.store_id = user_follows_store.store_id
  );
END;
$$;