-- Fix security vulnerability: Restrict public access to sensitive event contact information

-- Step 1: Drop the overly permissive policy that exposes contact information
DROP POLICY IF EXISTS "Public can view published event details only" ON public.events;

-- Step 2: Create a new restricted policy that only allows organizers to see all event data
CREATE POLICY "Organizers can view all own event data"
  ON public.events
  FOR SELECT
  USING (organizer_id = auth.uid());

-- Step 3: Create a policy for public access that excludes sensitive contact information
-- This policy will work with views or functions that don't expose sensitive data
CREATE POLICY "Public can view published events basic info only"
  ON public.events
  FOR SELECT
  USING (
    status = 'published'::event_status 
    AND organizer_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    AND FALSE -- This forces all public access to go through security functions
  );

-- Step 4: Update existing functions to ensure they have proper search_path (fixing linter warnings)
CREATE OR REPLACE FUNCTION public.get_event_public_data(event_id uuid)
RETURNS TABLE(
  id uuid, title text, description text, event_date timestamp with time zone, 
  category text, event_type text, price_from integer, max_capacity integer, 
  age_restriction text, banner_url text, venue_id uuid, organizer_id uuid, 
  status event_status, is_featured boolean, ticket_sales_start_date timestamp with time zone, 
  ticket_sales_end_date timestamp with time zone, terms_and_conditions text, 
  created_at timestamp with time zone, updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return event data WITHOUT contact information for public access
  RETURN QUERY
  SELECT 
    e.id, e.title, e.description, e.event_date, e.category, e.event_type,
    e.price_from, e.max_capacity, e.age_restriction, e.banner_url,
    e.venue_id, e.organizer_id, e.status, e.is_featured,
    e.ticket_sales_start_date, e.ticket_sales_end_date, 
    e.terms_and_conditions, e.created_at, e.updated_at
  FROM public.events e
  WHERE e.id = event_id 
    AND e.status = 'published'::event_status;
END;
$$;

-- Step 5: Update the organizer contact function to fix search path
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

-- Step 6: Create a comprehensive public events view function
CREATE OR REPLACE FUNCTION public.get_all_public_events()
RETURNS TABLE(
  id uuid, title text, description text, event_date timestamp with time zone, 
  category text, event_type text, price_from integer, max_capacity integer, 
  age_restriction text, banner_url text, venue_id uuid, organizer_id uuid, 
  status event_status, is_featured boolean, ticket_sales_start_date timestamp with time zone, 
  ticket_sales_end_date timestamp with time zone, terms_and_conditions text, 
  created_at timestamp with time zone, updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    e.id, e.title, e.description, e.event_date, e.category, e.event_type,
    e.price_from, e.max_capacity, e.age_restriction, e.banner_url,
    e.venue_id, e.organizer_id, e.status, e.is_featured,
    e.ticket_sales_start_date, e.ticket_sales_end_date, 
    e.terms_and_conditions, e.created_at, e.updated_at
  FROM public.events e
  WHERE e.status = 'published'::event_status;
$$;