-- Atualizar tabela de orders para suportar produtos digitais
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Criar tabela para transações de produtos
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER DEFAULT 0,
  seller_amount_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS na tabela transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para transactions
CREATE POLICY "Users can view own transactions as buyer" ON transactions
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Users can view own transactions as seller" ON transactions  
  FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "Allow checkout system to create transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow payment system to update transactions" ON transactions
  FOR UPDATE USING (true);

-- Criar função para calcular taxas da plataforma
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount_cents INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 5% de taxa da plataforma + R$ 0,39 fixo
  RETURN GREATEST((amount_cents * 0.05)::INTEGER + 39, 39);
END;
$$;

-- Trigger para calcular automaticamente as taxas
CREATE OR REPLACE FUNCTION update_transaction_amounts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.platform_fee_cents := calculate_platform_fee(NEW.amount_cents);
  NEW.seller_amount_cents := NEW.amount_cents - NEW.platform_fee_cents;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_update_transaction_amounts
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_amounts();

-- Criar tabela para chaves PIX dos vendedores
CREATE TABLE IF NOT EXISTS seller_payment_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  pix_key TEXT,
  bank_account JSONB,
  stripe_account_id TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seller_payment_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payment info" ON seller_payment_info
  FOR ALL USING (user_id = auth.uid());

-- Atualizar trigger para updated_at
CREATE OR REPLACE TRIGGER update_seller_payment_info_updated_at
  BEFORE UPDATE ON seller_payment_info
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();