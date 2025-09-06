-- Create a function to call the WhatsApp notification edge function via HTTP
CREATE OR REPLACE FUNCTION public.call_whatsapp_notification(
  p_order_id UUID,
  p_user_id UUID,
  p_product_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  webhook_payload JSONB;
  http_request_id bigint;
BEGIN
  -- Build the payload for the edge function
  webhook_payload := jsonb_build_object(
    'order_id', p_order_id,
    'user_id', p_user_id,
    'product_ids', p_product_ids
  );

  -- Use pg_net to make HTTP request to edge function
  -- Note: pg_net.http_post is available in Supabase
  SELECT net.http_post(
    url := 'https://phprhrwiuhalxdifdzgn.supabase.co/functions/v1/send-whatsapp-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT vault.decrypt_secret('SUPABASE_SERVICE_ROLE_KEY')).decrypted_secret
    ),
    body := webhook_payload
  ) INTO http_request_id;

  -- Log the request (optional)
  INSERT INTO public.whatsapp_notifications (
    user_id,
    order_id,
    product_id,
    whatsapp_number,
    message_template,
    n8n_webhook_url,
    status
  ) VALUES (
    p_user_id,
    p_order_id,
    (p_product_ids)[1], -- Use first product for now
    '',
    'Auto-trigger from payment',
    'internal',
    'pending'
  );

EXCEPTION WHEN OTHERS THEN
  -- Don't fail payment processing if WhatsApp notification fails
  NULL;
END;
$function$

-- Modify handle_successful_payment to use the new function
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
  new_order_id UUID;
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
  ) RETURNING id INTO new_order_id;

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

  -- Call WhatsApp notification function if there are digital products
  IF array_length(product_ids, 1) > 0 THEN
    PERFORM public.call_whatsapp_notification(new_order_id, session_record.user_id, product_ids);
  END IF;

END;
$function$