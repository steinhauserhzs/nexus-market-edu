-- Create coupons table for discount system
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL, -- percentage (0-100) or cents for fixed amount
  minimum_order_cents INTEGER DEFAULT 0,
  maximum_discount_cents INTEGER, -- only for percentage discounts
  usage_limit INTEGER, -- null = unlimited
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  product_ids UUID[], -- null = applies to all products
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active coupons for validation"
ON public.coupons FOR SELECT
USING (is_active = true AND NOW() BETWEEN valid_from AND COALESCE(valid_until, NOW() + INTERVAL '100 years'));

CREATE POLICY "Store owners can manage their coupons"
ON public.coupons FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = coupons.store_id AND s.owner_id = auth.uid()
  )
);

-- Coupon usage tracking
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  order_id UUID REFERENCES public.orders(id),
  discount_applied_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for coupon usage
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their coupon usage"
ON public.coupon_usage FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert coupon usage"
ON public.coupon_usage FOR INSERT
WITH CHECK (true);

-- Create function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_coupon_code TEXT,
  p_order_total_cents INTEGER,
  p_product_ids UUID[] DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  coupon_record RECORD;
  discount_amount INTEGER := 0;
  is_valid BOOLEAN := false;
  error_message TEXT := '';
BEGIN
  -- Get coupon
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = p_coupon_code AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Cupom não encontrado ou inativo'
    );
  END IF;
  
  -- Check date validity
  IF NOW() < coupon_record.valid_from OR (coupon_record.valid_until IS NOT NULL AND NOW() > coupon_record.valid_until) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Cupom expirado'
    );
  END IF;
  
  -- Check usage limit
  IF coupon_record.usage_limit IS NOT NULL AND coupon_record.used_count >= coupon_record.usage_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Limite de uso do cupom excedido'
    );
  END IF;
  
  -- Check minimum order value
  IF p_order_total_cents < coupon_record.minimum_order_cents THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Valor mínimo do pedido não atingido'
    );
  END IF;
  
  -- Check product restriction
  IF coupon_record.product_ids IS NOT NULL AND p_product_ids IS NOT NULL THEN
    IF NOT (coupon_record.product_ids && p_product_ids) THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Cupom não aplicável aos produtos selecionados'
      );
    END IF;
  END IF;
  
  -- Calculate discount
  IF coupon_record.discount_type = 'percentage' THEN
    discount_amount := (p_order_total_cents * coupon_record.discount_value / 100)::INTEGER;
    IF coupon_record.maximum_discount_cents IS NOT NULL THEN
      discount_amount := LEAST(discount_amount, coupon_record.maximum_discount_cents);
    END IF;
  ELSE
    discount_amount := coupon_record.discount_value;
  END IF;
  
  -- Ensure discount doesn't exceed order total
  discount_amount := LEAST(discount_amount, p_order_total_cents);
  
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', coupon_record.id,
    'discount_amount', discount_amount,
    'discount_type', coupon_record.discount_type,
    'name', coupon_record.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;