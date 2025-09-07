-- Comprehensive fix for all remaining security definer functions without search_path
-- This addresses CVE-2007-2138 and Supabase linter rule 0011_function_search_path_mutable

-- Fix mask_contact_info function
CREATE OR REPLACE FUNCTION public.mask_contact_info(contact_value text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
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

-- Fix validate_phone function 
CREATE OR REPLACE FUNCTION public.validate_phone(phone_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove caracteres não numéricos
  phone_input := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Verifica se tem entre 10 e 11 dígitos (formato brasileiro)
  IF length(phone_input) NOT IN (10, 11) THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se começa com código de área válido (11-99)
  IF substring(phone_input, 1, 2)::int < 11 OR substring(phone_input, 1, 2)::int > 99 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Fix create_stripe_session function
CREATE OR REPLACE FUNCTION public.create_stripe_session(
  product_ids uuid[], 
  user_id uuid, 
  success_url text DEFAULT NULL::text, 
  cancel_url text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function will be implemented in the edge function
  -- but we're creating the signature for type safety
  
  RETURN json_build_object(
    'status', 'pending',
    'message', 'Use edge function create-stripe-checkout instead'
  );
END;
$$;

-- The critical security fix is complete. The main vulnerability (unrestricted access to event contact info) has been resolved by:
-- 1. Removing the overly permissive RLS policy on events table
-- 2. Creating secure functions that exclude sensitive contact information for public access  
-- 3. Ensuring only event organizers can access contact info through dedicated functions
-- 4. Adding proper search_path to all security definer functions to prevent search path attacks