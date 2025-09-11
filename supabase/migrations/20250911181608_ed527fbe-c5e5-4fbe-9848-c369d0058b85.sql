-- Create activity log table to track user actions
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own activity logs
CREATE POLICY "Users can view own activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: System can insert activity logs
CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);

-- Add soft delete column to products table
ALTER TABLE public.products ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN deleted_by UUID REFERENCES auth.users(id);

-- Create index for soft delete queries
CREATE INDEX idx_products_deleted_at ON public.products(deleted_at);

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    entity_name,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_details
  );
END;
$$;

-- Function to soft delete product
CREATE OR REPLACE FUNCTION public.soft_delete_product(p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product_record RECORD;
  is_owner BOOLEAN := false;
BEGIN
  -- Check if user owns the product via store
  SELECT p.*, s.owner_id = auth.uid() as is_owner_check
  INTO product_record
  FROM public.products p
  JOIN public.stores s ON s.id = p.store_id
  WHERE p.id = p_product_id AND p.deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or already deleted';
  END IF;
  
  is_owner := product_record.is_owner_check;
  
  IF NOT is_owner THEN
    RAISE EXCEPTION 'Access denied: You can only delete your own products';
  END IF;
  
  -- Soft delete the product
  UPDATE public.products 
  SET 
    deleted_at = now(),
    deleted_by = auth.uid(),
    updated_at = now()
  WHERE id = p_product_id;
  
  -- Log the activity
  PERFORM public.log_activity(
    'PRODUCT_DELETED',
    'product',
    p_product_id,
    product_record.title,
    jsonb_build_object(
      'product_type', product_record.type,
      'price_cents', product_record.price_cents
    )
  );
  
  RETURN true;
END;
$$;