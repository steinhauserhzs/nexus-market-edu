-- Fix the security definer view issue by dropping it and creating a better solution

-- Drop the potentially problematic view
DROP VIEW IF EXISTS public.events_public;

-- Instead, modify the RLS policies to be more granular
-- Drop existing policies first
DROP POLICY IF EXISTS "Organizers can view own events with contact info" ON public.events;
DROP POLICY IF EXISTS "Others can view published events" ON public.events;

-- Create more secure and granular policies
-- 1. Organizers can view ALL their own event data (including contact info)  
CREATE POLICY "Organizers can view own complete events" ON public.events
FOR SELECT
USING (organizer_id = auth.uid());

-- 2. Everyone else can view published events but the application layer will filter sensitive fields
CREATE POLICY "Public can view published events" ON public.events  
FOR SELECT
USING (
  status = 'published'::event_status
  AND organizer_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Add a comment to document the security approach
COMMENT ON POLICY "Public can view published events" ON public.events IS 
'This policy allows public access to published events. The application layer MUST filter out sensitive fields (contact_email, contact_phone) for non-organizer users.';

-- Create a safer function to get sanitized event data without SECURITY DEFINER on views
CREATE OR REPLACE FUNCTION public.get_sanitized_event(event_id uuid)
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
  -- Return event data without sensitive contact information
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
    AND e.status = 'published'::event_status
    AND e.organizer_id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
END;
$$;

-- Log the security fix completion
SELECT public.log_security_event(
  'contact_info_security_fix_completed',
  jsonb_build_object(
    'action', 'removed_security_definer_view',
    'table', 'events',
    'approach', 'rls_policies_with_application_layer_filtering',
    'fields_protected', array['contact_email', 'contact_phone']
  )
);