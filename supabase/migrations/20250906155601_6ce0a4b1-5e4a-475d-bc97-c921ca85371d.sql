-- Modify handle_successful_payment to call WhatsApp notification
CREATE OR REPLACE FUNCTION public.handle_successful_payment(session_id text, payment_intent_id text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  session_record RECORD;
  product_record RECORD;
  product_data JSONB;
  product_ids UUID[] := '{}';
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

  -- Create licenses for digital products and collect product IDs
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
      
      -- Add to product IDs array for WhatsApp notification
      product_ids := array_append(product_ids, product_record.id);
    END IF;
  END LOOP;

  -- Call WhatsApp notification edge function if there are digital products
  IF array_length(product_ids, 1) > 0 THEN
    PERFORM pg_notify('whatsapp_notification', json_build_object(
      'order_id', (SELECT id FROM public.orders WHERE gateway_session_id = session_id LIMIT 1),
      'user_id', session_record.user_id,
      'product_ids', product_ids,
      'session_id', session_id
    )::text);
  END IF;

END;
$function$