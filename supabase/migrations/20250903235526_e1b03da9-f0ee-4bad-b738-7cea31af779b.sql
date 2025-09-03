-- Fix search path security issues for newly created functions
DROP FUNCTION IF EXISTS public.create_stripe_session(UUID[], UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.handle_successful_payment(TEXT, TEXT);

-- Recreate functions with proper search path
CREATE OR REPLACE FUNCTION public.create_stripe_session(
  product_ids UUID[],
  user_id UUID,
  success_url TEXT DEFAULT NULL,
  cancel_url TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  session_data JSON;
BEGIN
  -- This function will be implemented in the edge function
  -- but we're creating the signature for type safety
  
  RETURN json_build_object(
    'status', 'pending',
    'message', 'Use edge function create-stripe-checkout instead'
  );
END;
$$;

-- Recreate handle_successful_payment with proper search path
CREATE OR REPLACE FUNCTION public.handle_successful_payment(
  session_id TEXT,
  payment_intent_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  session_record RECORD;
  product_record RECORD;
  product_data JSONB;
BEGIN
  -- Get checkout session
  SELECT * FROM public.checkout_sessions 
  WHERE stripe_session_id = session_id 
  INTO session_record;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Checkout session not found: %', session_id;
  END IF;

  -- Update session status
  UPDATE public.checkout_sessions 
  SET 
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  WHERE stripe_session_id = session_id;

  -- Create order record
  INSERT INTO public.orders (
    user_id,
    total_cents,
    status,
    payment_status,
    payment_provider,
    gateway_session_id,
    stripe_payment_intent_id,
    external_order_id,
    metadata
  ) VALUES (
    session_record.user_id,
    session_record.total_amount_cents,
    'completed',
    'paid',
    'stripe',
    session_id,
    payment_intent_id,
    session_id,
    session_record.products
  );

  -- Create licenses for digital products
  FOR product_data IN SELECT * FROM jsonb_array_elements(session_record.products)
  LOOP
    SELECT * FROM public.products 
    WHERE id = (product_data->>'id')::UUID 
    INTO product_record;

    IF FOUND AND product_record.type IN ('digital', 'curso') THEN
      INSERT INTO public.licenses (
        user_id,
        product_id,
        is_active,
        created_at
      ) VALUES (
        session_record.user_id,
        product_record.id,
        true,
        now()
      ) ON CONFLICT (user_id, product_id) DO NOTHING;
    END IF;
  END LOOP;

END;
$$;