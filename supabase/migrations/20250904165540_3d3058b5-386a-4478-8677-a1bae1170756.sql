-- Enable RLS on stores (idempotent)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Recreate policy to allow users to create their own stores
DROP POLICY IF EXISTS "Users can create own stores" ON public.stores;
CREATE POLICY "Users can create own stores"
ON public.stores
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Recreate policy to allow owners to view their own stores
DROP POLICY IF EXISTS "Store owners can view their own stores" ON public.stores;
CREATE POLICY "Store owners can view their own stores"
ON public.stores
FOR SELECT
USING (auth.uid() = owner_id);
