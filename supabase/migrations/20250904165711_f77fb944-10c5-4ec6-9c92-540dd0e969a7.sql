-- Atualizar todos usuários existentes para ter role 'seller' se não tiverem
UPDATE public.profiles 
SET role = 'seller' 
WHERE role IS NULL OR role = 'user';

-- Alterar o padrão da coluna role para 'seller'
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'seller';