-- Create helper function to resolve email from CPF/phone/email
CREATE OR REPLACE FUNCTION public.get_email_by_identifier(p_identifier text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_identifier text;
  email_result text;
BEGIN
  IF p_identifier IS NULL OR length(trim(p_identifier)) = 0 THEN
    RETURN NULL;
  END IF;

  clean_identifier := lower(trim(p_identifier));

  -- If it looks like an email, verify it exists and return it
  IF position('@' IN clean_identifier) > 0 THEN
    SELECT email INTO email_result
    FROM public.profiles
    WHERE lower(email) = clean_identifier
    LIMIT 1;
    RETURN email_result; -- may be null if not found
  END IF;

  -- Normalize digits only for cpf/phone
  clean_identifier := regexp_replace(clean_identifier, '[^0-9]', '', 'g');

  -- Try CPF (11 digits)
  IF length(clean_identifier) = 11 THEN
    SELECT email INTO email_result
    FROM public.profiles
    WHERE regexp_replace(coalesce(cpf, ''), '[^0-9]', '', 'g') = clean_identifier
    LIMIT 1;

    IF email_result IS NOT NULL THEN
      RETURN email_result;
    END IF;
  END IF;

  -- Try phone (10 or 11 digits)
  IF length(clean_identifier) IN (10, 11) THEN
    SELECT email INTO email_result
    FROM public.profiles
    WHERE regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = clean_identifier
    LIMIT 1;
  END IF;

  RETURN email_result; -- may be null
END;
$$;

-- Allow both anonymous and authenticated clients to execute
GRANT EXECUTE ON FUNCTION public.get_email_by_identifier(text) TO anon, authenticated;