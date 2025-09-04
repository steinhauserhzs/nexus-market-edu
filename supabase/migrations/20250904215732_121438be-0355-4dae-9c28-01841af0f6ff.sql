-- Tighten RLS on orders and order_items to prevent any public read and ensure store owners can access their data without exposing customer PII publicly.

-- ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Recreate policies scoping to authenticated role only
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Store owners can view orders for their products" ON public.orders;
CREATE POLICY "Store owners can view orders for their products"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    JOIN public.stores s ON s.id = p.store_id
    WHERE oi.order_id = orders.id
      AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ORDER_ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Ensure users can view their own order items (scope to authenticated)
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
  )
);

-- Allow store owners to view order items for their products
DROP POLICY IF EXISTS "Store owners can view order items for their products" ON public.order_items;
CREATE POLICY "Store owners can view order items for their products"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    JOIN public.stores s ON s.id = p.store_id
    WHERE p.id = order_items.product_id
      AND s.owner_id = auth.uid()
  )
);
