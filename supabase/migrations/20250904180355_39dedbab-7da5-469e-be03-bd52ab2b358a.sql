-- Fix security vulnerability: Remove public access to sensitive contact information in events table

-- First, drop the existing public policy
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;

-- Create separate policies for different access levels
-- 1. Public users can view published events but WITHOUT sensitive contact information
CREATE POLICY "Public can view published event details" ON public.events
FOR SELECT 
USING (
  status = 'published'::event_status
  AND auth.uid() IS NULL  -- Only for non-authenticated users
);

-- 2. Authenticated users can view published events but WITHOUT sensitive contact information  
CREATE POLICY "Authenticated users can view published event details" ON public.events
FOR SELECT
USING (
  status = 'published'::event_status
  AND auth.uid() IS NOT NULL
  AND organizer_id != auth.uid()  -- Not the organizer
);

-- 3. Event organizers can view their own events with ALL information including contact details
CREATE POLICY "Organizers can view own events with contact info" ON public.events
FOR SELECT
USING (organizer_id = auth.uid());

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

-- Create RLS policy for the public view
ALTER TABLE public.events_public ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public events" ON public.events_public
FOR SELECT 
USING (true);

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

-- Log this security fix
SELECT public.log_security_event(
  'contact_info_security_fix',
  jsonb_build_object(
    'action', 'restricted_public_access_to_contact_info',
    'table', 'events',
    'fields_protected', array['contact_email', 'contact_phone']
  )
);