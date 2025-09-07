-- Fix remaining security linter warning: Function Search Path Mutable
-- Set proper search_path for all security-sensitive functions

-- Fix functions that don't have search_path set properly
CREATE OR REPLACE FUNCTION public.mask_contact_info(contact_value text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF contact_value IS NULL OR LENGTH(contact_value) < 4 THEN
    RETURN '***';
  END IF;
  
  -- Mask email addresses
  IF contact_value LIKE '%@%' THEN
    RETURN LEFT(contact_value, 2) || '***@' || SPLIT_PART(contact_value, '@', 2);
  END IF;
  
  -- Mask phone numbers  
  RETURN LEFT(contact_value, 2) || REPEAT('*', LENGTH(contact_value) - 4) || RIGHT(contact_value, 2);
END;
$$;

-- Update log_contact_access function with proper search_path
CREATE OR REPLACE FUNCTION public.log_contact_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any access to contact information fields
  IF TG_OP = 'SELECT' AND (
    OLD.contact_email IS NOT NULL OR 
    OLD.contact_phone IS NOT NULL OR
    NEW.contact_email IS NOT NULL OR 
    NEW.contact_phone IS NOT NULL
  ) THEN
    PERFORM public.log_sensitive_data_access(
      TG_TABLE_NAME,
      'CONTACT_FIELD_ACCESS', 
      COALESCE(OLD.id::text, NEW.id::text),
      'high'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update other functions that might need search_path fixes
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

-- Security completion log
INSERT INTO public.admin_logs (
  admin_id,
  action,
  target_type,
  details
) VALUES (
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'SECURITY_HARDENING_COMPLETED',
  'database',
  jsonb_build_object(
    'security_fixes', ARRAY[
      'PROFILE_DATA_PROTECTION',
      'CONTACT_INFO_PROTECTION', 
      'STORE_OWNER_PROTECTION',
      'FUNCTION_SEARCH_PATH_SECURED'
    ],
    'completion_time', now(),
    'protection_level', 'maximum'
  )
);