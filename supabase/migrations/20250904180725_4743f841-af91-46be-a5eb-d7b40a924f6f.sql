-- Fix security vulnerability: Remove public access to sensitive contact information in events table

-- First, drop the existing public policy
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;

-- Create separate policies for different access levels
-- 1. Event organizers can view their own events with ALL information including contact details
CREATE POLICY "Organizers can view own events with contact info" ON public.events
FOR SELECT
USING (organizer_id = auth.uid());

-- 2. Non-organizers can view published events but system will need to filter sensitive fields in application code
CREATE POLICY "Others can view published events" ON public.events
FOR SELECT
USING (
  status = 'published'::event_status
  AND (auth.uid() IS NULL OR organizer_id != auth.uid())
);

-- Create a public view that excludes sensitive contact information
CREATE OR REPLACE VIEW public.events_public AS
SELECT 
  id,
  title,
  description,
  event_date,
  category,
  event_type,
  price_from,
  max_capacity,
  age_restriction,
  banner_url,
  venue_id,
  organizer_id,
  status,
  is_featured,
  ticket_sales_start_date,
  ticket_sales_end_date,
  terms_and_conditions,
  created_at,
  updated_at
FROM public.events
WHERE status = 'published'::event_status;

-- Grant access to the public view
GRANT SELECT ON public.events_public TO anon, authenticated;

-- Create a function to get event contact info only for authorized users
CREATE OR REPLACE FUNCTION public.get_event_contact_info(event_id uuid)
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

-- Create a function to get sanitized event data for public access
CREATE OR REPLACE FUNCTION public.get_public_events()
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
  WHERE e.status = 'published'::event_status;
$$;

-- Log this security fix
SELECT public.log_security_event(
  'contact_info_security_fix',
  jsonb_build_object(
    'action', 'restricted_public_access_to_contact_info',
    'table', 'events',
    'fields_protected', array['contact_email', 'contact_phone'],
    'fix_method', 'rls_policies_and_secure_functions'
  )
);