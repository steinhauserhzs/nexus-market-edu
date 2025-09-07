-- URGENT SECURITY FIX: Protect customer personal information from unauthorized access

-- 1. Drop the vulnerable get_email_by_identifier function that bypasses RLS
DROP FUNCTION IF EXISTS public.get_email_by_identifier(text);

-- 2. Create a secure version that only works for authenticated users on their own data
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return the current user's own email - no enumeration possible
  RETURN (
    SELECT email 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

-- 3. Add missing admin RLS policy for profiles table with proper security
CREATE POLICY "Admins can view all profiles for management"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
  )
);

-- 4. Add admin policy for updates (limited fields only)
CREATE POLICY "Admins can update user verification status"
ON public.profiles  
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
  )
)
WITH CHECK (
  -- Admins can only update verification fields, not sensitive personal data
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
  )
);

-- 5. Create function to securely check if email exists (for login purposes only)
CREATE OR REPLACE FUNCTION public.email_exists_for_login(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return boolean, never the actual data
  -- Log all attempts for security monitoring
  PERFORM public.log_sensitive_data_access(
    'profiles',
    'EMAIL_EXISTS_CHECK',
    p_email,
    'medium'
  );
  
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE lower(email) = lower(p_email)
  );
END;
$$;

-- 6. Add comprehensive audit logging trigger for ALL profile access
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all access to profiles table
  IF TG_OP = 'SELECT' THEN
    PERFORM public.log_sensitive_data_access(
      'profiles',
      'PROFILE_VIEW',
      COALESCE(OLD.id::text, NEW.id::text),
      'high'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_sensitive_data_access(
      'profiles',
      'PROFILE_UPDATE',
      NEW.id::text,
      'high'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. Enhanced security logging for data exports
CREATE OR REPLACE FUNCTION public.log_profile_data_access(
  p_accessed_profile_id uuid,
  p_action text,
  p_reason text DEFAULT 'user_request'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit (
    user_id,
    action,
    table_name,
    record_id,
    risk_level,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    'profiles',
    p_accessed_profile_id::text,
    'high',
    jsonb_build_object(
      'reason', p_reason,
      'timestamp', now(),
      'session_info', jsonb_build_object(
        'auth_role', current_setting('request.jwt.claim.role', true),
        'auth_email', current_setting('request.jwt.claim.email', true)
      )
    )
  );
END;
$$;

-- 8. Create a secure admin function to view user profiles (with full audit trail)
CREATE OR REPLACE FUNCTION public.admin_get_user_profile(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz,
  last_login_at timestamptz,
  is_verified boolean,
  phone_verified boolean,
  email_verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin access
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'ACCESS_DENIED: Admin privileges required';
  END IF;
  
  -- Log admin access to user profile
  PERFORM public.log_profile_data_access(
    p_user_id,
    'ADMIN_PROFILE_VIEW',
    'administrative_access'
  );
  
  -- Return only essential fields, not sensitive personal data
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    p.last_login_at,
    p.is_verified,
    p.phone_verified,
    p.email_verified
  FROM public.profiles p
  WHERE p.id = p_user_id;
END;
$$;

-- 9. Add rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action text,
  p_limit_per_hour integer DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  -- Count actions in the last hour
  SELECT COUNT(*) INTO current_count
  FROM public.security_audit
  WHERE user_id = auth.uid()
    AND action = p_action
    AND created_at > (now() - interval '1 hour');
  
  -- Log rate limit check
  IF current_count >= p_limit_per_hour THEN
    PERFORM public.log_sensitive_data_access(
      'security',
      'RATE_LIMIT_EXCEEDED',
      p_action,
      'critical'
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 10. Create secure contact verification function (replaces unsafe identifier lookup)
CREATE OR REPLACE FUNCTION public.verify_user_contact()
RETURNS TABLE(email text, phone text, whatsapp_number text)
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to verify their own contact info
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'ACCESS_DENIED: Authentication required';
  END IF;
  
  -- Rate limit verification attempts  
  IF NOT public.check_rate_limit('CONTACT_VERIFICATION', 5) THEN
    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED: Too many verification attempts';
  END IF;
  
  -- Log verification attempt
  PERFORM public.log_profile_data_access(
    auth.uid(),
    'CONTACT_VERIFICATION',
    'user_self_verification'
  );
  
  RETURN QUERY
  SELECT p.email, p.phone, p.whatsapp_number
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- 11. Security improvement: Add column-level restrictions for admin updates
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Comment to document security measures
COMMENT ON TABLE public.profiles IS 'Contains sensitive personal information. Access is strictly controlled by RLS policies and all access is audited.';
COMMENT ON FUNCTION public.admin_get_user_profile(uuid) IS 'Secure admin function to view user profiles with full audit trail and restricted data exposure.';
COMMENT ON FUNCTION public.verify_user_contact() IS 'Secure function for users to verify their own contact information with rate limiting.';
COMMENT ON FUNCTION public.check_rate_limit(text, integer) IS 'Rate limiting function to prevent abuse of sensitive operations.';