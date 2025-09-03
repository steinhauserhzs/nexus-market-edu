-- Corrigir problema de RLS na tabela product_commissions
-- A tabela product_commissions não tem políticas RLS

-- Criar políticas RLS para product_commissions
CREATE POLICY "Store owners can manage product commissions" ON public.product_commissions
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM products p 
    JOIN stores s ON s.id = p.store_id 
    WHERE p.id = product_commissions.product_id 
    AND s.owner_id = auth.uid()
  )
);

-- Política para afiliados verem comissões de produtos que estão autorizados
CREATE POLICY "Affiliates can view product commissions" ON public.product_commissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM affiliates a 
    JOIN stores s ON s.id = a.store_id 
    JOIN products p ON p.store_id = s.id 
    WHERE p.id = product_commissions.product_id 
    AND a.user_id = auth.uid() 
    AND a.status = 'approved'
  )
);