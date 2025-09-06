-- Adicionar campo whatsapp_number na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN whatsapp_number VARCHAR(20);

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