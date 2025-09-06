-- Criar tabela para rastrear notificações WhatsApp
CREATE TABLE public.whatsapp_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  whatsapp_number TEXT NOT NULL,
  message_template TEXT NOT NULL,
  message_sent TEXT,
  n8n_webhook_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, retry
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_notifications ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own whatsapp notifications" 
ON public.whatsapp_notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Store owners can view their products notifications" 
ON public.whatsapp_notifications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM products p 
  JOIN stores s ON s.id = p.store_id 
  WHERE p.id = whatsapp_notifications.product_id 
  AND s.owner_id = auth.uid()
));

CREATE POLICY "System can manage whatsapp notifications" 
ON public.whatsapp_notifications 
FOR ALL 
USING (true);

-- Inserir configurações padrão do n8n na system_configs
INSERT INTO public.system_configs (config_key, config_value, description) VALUES 
('n8n_webhook_url', '""', 'URL do webhook n8n para envio de mensagens WhatsApp'),
('n8n_enabled', 'false', 'Habilitar integração com n8n para WhatsApp'),
('whatsapp_message_template', '"Olá {nome}! 🎉\n\nSua compra de \"{produto}\" foi confirmada!\n\n🔐 Seus dados de acesso:\nEmail: {email}\nSenha: Sua senha atual\n\n🔗 Acesse sua área de membros:\n{link_area_membros}\n\nEm caso de dúvidas, estamos aqui para ajudar!"', 'Template da mensagem WhatsApp com placeholders'),
('whatsapp_delay_minutes', '5', 'Minutos para aguardar antes de enviar WhatsApp após pagamento')
ON CONFLICT (config_key) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_notifications_updated_at
BEFORE UPDATE ON public.whatsapp_notifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Função para enviar notificação WhatsApp
CREATE OR REPLACE FUNCTION public.send_whatsapp_notification_after_payment(
  p_user_id UUID,
  p_order_id UUID,
  p_product_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_profile RECORD;
  product_info RECORD;
  n8n_enabled BOOLEAN;
  webhook_url TEXT;
  message_template TEXT;
  delay_minutes INTEGER;
BEGIN
  -- Verificar se n8n está habilitado
  SELECT (config_value::text)::boolean INTO n8n_enabled
  FROM system_configs WHERE config_key = 'n8n_enabled';
  
  IF NOT COALESCE(n8n_enabled, false) THEN
    RETURN false;
  END IF;

  -- Buscar dados do usuário
  SELECT * INTO user_profile
  FROM profiles WHERE id = p_user_id;
  
  IF user_profile.whatsapp_number IS NULL OR user_profile.whatsapp_number = '' THEN
    RETURN false;
  END IF;

  -- Buscar dados do produto
  SELECT * INTO product_info
  FROM products WHERE id = p_product_id;

  -- Buscar configurações
  SELECT config_value::text INTO webhook_url
  FROM system_configs WHERE config_key = 'n8n_webhook_url';
  
  SELECT config_value::text INTO message_template
  FROM system_configs WHERE config_key = 'whatsapp_message_template';
  
  SELECT (config_value::text)::integer INTO delay_minutes
  FROM system_configs WHERE config_key = 'whatsapp_delay_minutes';

  -- Remover aspas extras do webhook_url e message_template
  webhook_url := TRIM(BOTH '"' FROM webhook_url);
  message_template := TRIM(BOTH '"' FROM message_template);
  
  IF webhook_url IS NULL OR webhook_url = '' THEN
    RETURN false;
  END IF;

  -- Criar registro de notificação
  INSERT INTO whatsapp_notifications (
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
    p_product_id,
    user_profile.whatsapp_number,
    message_template,
    webhook_url,
    'pending'
  );

  RETURN true;
END;
$$;

-- Atualizar função handle_successful_payment para incluir WhatsApp
CREATE OR REPLACE FUNCTION public.handle_successful_payment(session_id text, payment_intent_id text DEFAULT NULL::text)
RETURNS void
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

  -- Create licenses for digital products and trigger WhatsApp notifications
  FOR product_data IN SELECT * FROM jsonb_array_elements(session_record.products)
  LOOP
    SELECT * FROM public.products 
    WHERE id = (product_data->>'id')::UUID 
    INTO product_record;

    IF FOUND AND product_record.type IN ('digital', 'curso') THEN
      -- Create license
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

      -- Trigger WhatsApp notification
      PERFORM public.send_whatsapp_notification_after_payment(
        session_record.user_id,
        (SELECT id FROM orders WHERE stripe_payment_intent_id = payment_intent_id ORDER BY created_at DESC LIMIT 1),
        product_record.id
      );
    END IF;
  END LOOP;

END;
$$;