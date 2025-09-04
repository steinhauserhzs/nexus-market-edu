-- Simple admin function to reset user password (development only)
-- This creates a recovery token that can be used to set a new password
CREATE OR REPLACE FUNCTION public.admin_create_password_recovery(user_email text)
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recovery_token text;
  user_record record;
BEGIN
  -- Find user by email
  SELECT id, email INTO user_record 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;
  
  -- Generate a simple recovery token (timestamp based for development)
  recovery_token := encode(digest(user_email || now()::text, 'sha256'), 'hex');
  
  -- Log the password reset attempt
  INSERT INTO public.security_logs (
    user_id,
    action,
    details,
    created_at
  ) VALUES (
    user_record.id,
    'admin_password_reset_initiated',
    jsonb_build_object(
      'email', user_email,
      'recovery_token', recovery_token,
      'initiated_by', 'admin'
    ),
    now()
  );
  
  RETURN recovery_token;
END;
$$;

-- Execute the recovery initiation for the specific user
SELECT public.admin_create_password_recovery('sousa.mds93@gmail.com') as recovery_token;