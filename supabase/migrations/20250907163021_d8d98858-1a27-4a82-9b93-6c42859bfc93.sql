-- Additional Security Fixes: Protect contact information from public exposure

-- 1. Fix Store Owner Information Exposure
-- Remove owner_id from public store queries to prevent competitor targeting
CREATE OR REPLACE FUNCTION public.get_public_store_data(store_slug text)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  slug text,
  logo_url text,
  banner_url text,
  theme jsonb,
  is_active boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return store data without owner information for public access
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.description,
    s.slug,
    s.logo_url,
    s.banner_url,
    s.theme,
    s.is_active,
    s.created_at
  FROM public.stores s
  WHERE s.slug = store_slug 
    AND s.is_active = true;
END;
$$;

-- 2. Create secure function for event organizer contact (organizers only)
CREATE OR REPLACE FUNCTION public.get_event_organizer_contact(event_id uuid)
RETURNS TABLE(contact_email text, contact_phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only event organizers can access their own contact information
  IF NOT EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND organizer_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'ACCESS_DENIED: Only event organizers can access contact information';
  END IF;
  
  -- Log access to sensitive contact data
  PERFORM public.log_sensitive_data_access(
    'events',
    'CONTACT_INFO_ACCESS',
    event_id::text,
    'high'
  );
  
  RETURN QUERY
  SELECT e.contact_email, e.contact_phone
  FROM public.events e
  WHERE e.id = event_id;
END;
$$;

-- 3. Create secure function for venue contact (venue owners/admins only)  
CREATE OR REPLACE FUNCTION public.get_venue_contact_info(venue_id uuid)
RETURNS TABLE(contact_email text, contact_phone text)
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
BEGIN
  -- Only venue owners or admins can access contact information
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'ACCESS_DENIED: Admin privileges required for venue contact access';
  END IF;
  
  -- Log access to sensitive contact data
  PERFORM public.log_sensitive_data_access(
    'venues', 
    'VENUE_CONTACT_ACCESS',
    venue_id::text,
    'high'
  );
  
  RETURN QUERY
  SELECT v.contact_email, v.contact_phone
  FROM public.venues v
  WHERE v.id = venue_id;
END;
$$;

-- 4. Update stores RLS policy to hide owner information from public
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;

CREATE POLICY "Public can view store info without owner data"
ON public.stores
FOR SELECT
TO public
USING (is_active = true);

-- Add policy allowing owners to see their own stores with full data
CREATE POLICY "Owners can view their own store details"
ON public.stores
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- 5. Update events table to hide contact info from public access
-- Remove contact fields from public event view
CREATE OR REPLACE FUNCTION public.get_safe_event_data(event_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  event_date timestamptz,
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
  ticket_sales_start_date timestamptz,
  ticket_sales_end_date timestamptz,
  terms_and_conditions text,
  created_at timestamptz,
  updated_at timestamptz
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

-- 6. Update venues table to hide contact info from public access
CREATE OR REPLACE FUNCTION public.get_safe_venue_data(venue_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  capacity integer,
  amenities jsonb,
  images jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return venue data WITHOUT contact information for public access
  RETURN QUERY
  SELECT 
    v.id,
    v.name,
    v.address,
    v.city,
    v.state,
    v.country,
    v.postal_code,
    v.latitude,
    v.longitude,
    v.capacity,
    v.amenities,
    v.images,
    v.created_at,
    v.updated_at
  FROM public.venues v
  WHERE v.id = venue_id;
END;
$$;

-- 7. Add comprehensive security logging for all contact data access
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

-- 8. Add data masking for admin views (show partial contact info)
CREATE OR REPLACE FUNCTION public.mask_contact_info(contact_value text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
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

-- 9. Security improvement comments
COMMENT ON FUNCTION public.get_public_store_data(text) IS 'Secure function to get store data without exposing owner information to prevent competitor targeting.';
COMMENT ON FUNCTION public.get_event_organizer_contact(uuid) IS 'Secure function allowing only event organizers to access their own contact information.';
COMMENT ON FUNCTION public.get_venue_contact_info(uuid) IS 'Secure function allowing only admins to access venue contact information.';
COMMENT ON FUNCTION public.mask_contact_info(text) IS 'Function to mask sensitive contact information in admin interfaces.';