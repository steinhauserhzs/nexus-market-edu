-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin function to reset user password (for development/testing purposes)
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(
  user_email text,
  new_password text
) 
RETURNS boolean
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;
  
  -- Update password using Supabase auth admin functions
  -- Note: This requires service role permissions
  UPDATE auth.users 
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;
  
  RETURN true;
END;
$$;

-- Call the function to update the specific user's password
SELECT public.admin_reset_user_password('sousa.mds93@gmail.com', '123456');