-- Corrigir problemas de segurança das funções

-- Função calculate_platform_fee com search_path seguro
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount_cents INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 5% de taxa da plataforma + R$ 0,39 fixo
  RETURN GREATEST((amount_cents * 0.05)::INTEGER + 39, 39);
END;
$$;

-- Função update_transaction_amounts com search_path seguro  
CREATE OR REPLACE FUNCTION update_transaction_amounts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.platform_fee_cents := calculate_platform_fee(NEW.amount_cents);
  NEW.seller_amount_cents := NEW.amount_cents - NEW.platform_fee_cents;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;