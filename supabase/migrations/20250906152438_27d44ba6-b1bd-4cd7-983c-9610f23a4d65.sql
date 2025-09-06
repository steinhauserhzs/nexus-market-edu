-- Add INSERT policy for stores table to allow users to create their own stores
CREATE POLICY "Store owners can create stores" 
ON public.stores 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Also ensure store owners can view their own stores (might be missing)
DROP POLICY IF EXISTS "Store owners can view own stores" ON public.stores;
CREATE POLICY "Store owners can view own stores" 
ON public.stores 
FOR SELECT 
USING (auth.uid() = owner_id);