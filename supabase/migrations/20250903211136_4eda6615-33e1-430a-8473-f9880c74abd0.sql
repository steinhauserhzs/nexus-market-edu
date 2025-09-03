-- Criar tabela para rastrear visualizações de produtos
CREATE TABLE public.product_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  referrer text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela para rastrear adições ao carrinho
CREATE TABLE public.cart_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  ip_address inet,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela para mensagens entre clientes e vendedores
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  replied_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para product_views
CREATE POLICY "Anyone can create product views" 
ON public.product_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Store owners can view their product analytics" 
ON public.product_views 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM products p 
  JOIN stores s ON s.id = p.store_id 
  WHERE p.id = product_views.product_id 
  AND s.owner_id = auth.uid()
));

-- Políticas para cart_analytics
CREATE POLICY "Anyone can create cart analytics" 
ON public.cart_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Store owners can view their cart analytics" 
ON public.cart_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM products p 
  JOIN stores s ON s.id = p.store_id 
  WHERE p.id = cart_analytics.product_id 
  AND s.owner_id = auth.uid()
));

-- Políticas para messages
CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can update their received messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = receiver_id);

-- Criar índices para performance
CREATE INDEX idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX idx_product_views_created_at ON public.product_views(created_at);
CREATE INDEX idx_cart_analytics_product_id ON public.cart_analytics(product_id);
CREATE INDEX idx_cart_analytics_created_at ON public.cart_analytics(created_at);
CREATE INDEX idx_messages_store_id ON public.messages(store_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);

-- Trigger para atualizar updated_at em messages
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();