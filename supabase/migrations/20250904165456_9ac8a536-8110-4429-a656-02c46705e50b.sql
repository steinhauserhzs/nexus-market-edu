-- Ensure RLS is enabled on stores (idempotent)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own stores
CREATE POLICY IF NOT EXISTS "Users can create own stores"
ON public.stores
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Allow store owners to view their own stores (even if inactive)
CREATE POLICY IF NOT EXISTS "Store owners can view their own stores"
ON public.stores
FOR SELECT
USING (auth.uid() = owner_id);
