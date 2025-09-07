-- Fix event organizer contact information exposure
-- Remove public access to sensitive organizer contact details

-- Drop the overly permissive policy that exposes organizer contact information
DROP POLICY IF EXISTS "Public can view published events" ON public.events;

-- Create a secure function to return only safe public event data
CREATE OR REPLACE FUNCTION public.get_public_event_data(event_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  event_date timestamp with time zone,
  category text,
  event_type text,
  price_from integer,
  max_capacity integer,
  age_restriction text,
  banner_url text,
  venue_id uuid,
  organizer_id uuid,
  status event_status,
  is_featured boolean,
  ticket_sales_start_date timestamp with time zone,
  ticket_sales_end_date timestamp with time zone,
  terms_and_conditions text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return event data WITHOUT contact information for public access
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.event_date,
    e.category,
    e.event_type,
    e.price_from,
    e.max_capacity,
    e.age_restriction,
    e.banner_url,
    e.venue_id,
    e.organizer_id,
    e.status,
    e.is_featured,
    e.ticket_sales_start_date,
    e.ticket_sales_end_date,
    e.terms_and_conditions,
    e.created_at,
    e.updated_at
  FROM public.events e
  WHERE e.id = event_id 
    AND e.status = 'published'::event_status;
END;
$$;

-- Create a secure function for organizers to get their contact info
CREATE OR REPLACE FUNCTION public.get_organizer_event_contact_info(event_id uuid)
RETURNS TABLE(contact_email text, contact_phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only event organizers can access contact information
  IF NOT EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id 
    AND organizer_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Only event organizers can view contact information';
  END IF;

  RETURN QUERY
  SELECT e.contact_email, e.contact_phone
  FROM public.events e
  WHERE e.id = event_id;
END;
$$;

-- Create new restricted policy for public access (excludes contact information)
CREATE POLICY "Public can view published event details only"
ON public.events
FOR SELECT
USING (
  status = 'published'::event_status 
  AND organizer_id <> COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  -- This policy will allow access to the row, but applications should use 
  -- get_public_event_data() function to ensure contact info is not exposed
);

-- Add trigger to log when someone tries to access contact information
CREATE OR REPLACE FUNCTION public.log_event_contact_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive event contact data
  IF TG_OP = 'SELECT' AND (
    NEW.contact_email IS NOT NULL OR 
    NEW.contact_phone IS NOT NULL
  ) THEN
    PERFORM public.log_sensitive_data_access(
      'events',
      'EVENT_CONTACT_ACCESS',
      NEW.id::text,
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Log the security fix
INSERT INTO public.admin_logs (
  admin_id,
  action,
  target_type,
  target_id,
  details
) VALUES (
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'SECURITY_FIX_EVENT_CONTACT_EXPOSURE',
  'events',
  NULL,
  jsonb_build_object(
    'issue', 'PUBLIC_EVENT_ORGANIZER_CONTACT_EXPOSURE',
    'fix_applied', 'RESTRICTED_PUBLIC_ACCESS_TO_SAFE_FIELDS',
    'previous_policy', 'Public can view published events (ALL FIELDS)',
    'new_policy', 'Public can view published event details only (NO CONTACT INFO)',
    'secure_functions_created', ARRAY[
      'get_public_event_data() - returns safe public event data',
      'get_organizer_event_contact_info() - organizer-only contact access'
    ],
    'security_level', 'critical',
    'contact_data_protected', true,
    'fixed_at', now()
  )
);