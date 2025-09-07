-- Fix the remaining security issues: add search_path to functions without it

-- Fix increment_coupon_usage function
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.coupons 
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = coupon_id;
END;
$$;

-- Fix validate_coupon function
CREATE OR REPLACE FUNCTION public.validate_coupon(p_coupon_code text, p_order_total_cents integer, p_product_ids uuid[] DEFAULT NULL::uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;