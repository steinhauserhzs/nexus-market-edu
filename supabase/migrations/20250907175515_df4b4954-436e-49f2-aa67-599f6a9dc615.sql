-- Fix remaining security linter warnings: Add search_path to functions missing it

-- Update functions that are security definers but missing explicit search_path
-- This addresses the remaining linter warnings about mutable search paths

-- Fix get_public_events function
CREATE OR REPLACE FUNCTION public.get_public_events()
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

-- Fix get_sanitized_event function
CREATE OR REPLACE FUNCTION public.get_sanitized_event(event_id uuid)
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
  -- Return event data without sensitive contact information
  RETURN QUERY
  SELECT 
    e.id, e.title, e.description, e.event_date, e.category, e.event_type,
    e.price_from, e.max_capacity, e.age_restriction, e.banner_url,
    e.venue_id, e.organizer_id, e.status, e.is_featured,
    e.ticket_sales_start_date, e.ticket_sales_end_date, 
    e.terms_and_conditions, e.created_at, e.updated_at
  FROM public.events e
  WHERE e.id = event_id 
    AND e.status = 'published'::event_status
    AND e.organizer_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
END;
$$;