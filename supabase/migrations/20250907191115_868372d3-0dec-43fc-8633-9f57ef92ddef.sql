-- Create verification codes table for phone and CPF verification
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('phone', 'cpf')),
  contact_value TEXT NOT NULL, -- phone number or CPF
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER NOT NULL DEFAULT 0,
  is_used BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own verification codes"
ON public.verification_codes
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Create index for performance
CREATE INDEX idx_verification_codes_user_type ON public.verification_codes(user_id, type);
CREATE INDEX idx_verification_codes_expires ON public.verification_codes(expires_at);

-- Function to cleanup expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < now() AND is_used = false;
END;
$$;

-- Function to verify code and update profile
CREATE OR REPLACE FUNCTION public.verify_code_and_update_profile(
  p_code TEXT,
  p_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verification_record RECORD;
  result JSONB;
BEGIN
  -- Get verification code
  SELECT * INTO verification_record
  FROM public.verification_codes
  WHERE user_id = auth.uid()
    AND code = p_code
    AND type = p_type
    AND expires_at > now()
    AND is_used = false
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Código inválido ou expirado'
    );
  END IF;

  -- Check attempts
  IF verification_record.attempts >= 3 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Muitas tentativas. Solicite um novo código'
    );
  END IF;

  -- Mark as used
  UPDATE public.verification_codes
  SET is_used = true, verified_at = now()
  WHERE id = verification_record.id;

  -- Update profile verification status
  IF p_type = 'phone' THEN
    UPDATE public.profiles
    SET phone_verified = true, updated_at = now()
    WHERE id = auth.uid();
  ELSIF p_type = 'cpf' THEN
    UPDATE public.profiles
    SET cpf_verified = true, updated_at = now()
    WHERE id = auth.uid();
  END IF;

  -- Log security event
  PERFORM public.log_sensitive_data_access(
    'verification_codes',
    'VERIFICATION_SUCCESS',
    auth.uid()::text,
    'high'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Verificação realizada com sucesso'
  );
END;
$$;