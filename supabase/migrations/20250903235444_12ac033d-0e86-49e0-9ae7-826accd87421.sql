-- Create edge function for Stripe checkout
CREATE OR REPLACE FUNCTION public.create_stripe_session(
  product_ids UUID[],
  user_id UUID,
  success_url TEXT DEFAULT NULL,
  cancel_url TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update orders table to support multiple payment methods
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS external_order_id TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create checkout sessions tracking table
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  products JSONB NOT NULL,
  total_amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  success_url TEXT,
  cancel_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on checkout_sessions
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for checkout_sessions
CREATE POLICY "Users can view own checkout sessions" ON public.checkout_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own checkout sessions" ON public.checkout_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update checkout sessions" ON public.checkout_sessions
  FOR UPDATE
  USING (true);

-- Create function to handle successful payments
CREATE OR REPLACE FUNCTION public.handle_successful_payment(
  session_id TEXT,
  payment_intent_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
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