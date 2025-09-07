-- SECURITY FIX: Protect venue contact information from spam harvesting
-- The venues table doesn't have owner_id, so we'll focus on admin-only contact access

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view venues" ON public.venues;

-- Create secure policies for venues table
-- 1. Admins can view all venue data (including contact information)
CREATE POLICY "Admins can view all venues" 
ON public.venues 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- 2. Admins can manage all venues  
CREATE POLICY "Admins can manage all venues" 
ON public.venues 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Create a public view for safe venue data (WITHOUT contact information)
CREATE OR REPLACE VIEW public.venues_public AS
SELECT 
  id,
  name,
  address,
  city,
  state,
  capacity,
  description,
  website_url,
  facilities,
  parking_available,
  accessibility_features,
  created_at,
  updated_at
FROM public.venues;

-- Grant public access to the safe view
GRANT SELECT ON public.venues_public TO public;
GRANT SELECT ON public.venues_public TO anon;

-- Update the existing get_public_venues_list function to match actual table structure
CREATE OR REPLACE FUNCTION public.get_public_venues_list()
RETURNS TABLE(
  id uuid, 
  name text, 
  address text, 
  city text, 
  state text, 
  capacity integer,
  description text,
  website_url text,
  facilities text[],
  parking_available boolean,
  accessibility_features text[],
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return all venues WITHOUT contact information for public access
  RETURN QUERY
  SELECT 
    v.id, v.name, v.address, v.city, v.state, v.capacity, v.description,
    v.website_url, v.facilities, v.parking_available, v.accessibility_features,
    v.created_at, v.updated_at
  FROM public.venues v;
END;
$$;

-- Grant execute permission to public and anon roles
GRANT EXECUTE ON FUNCTION public.get_public_venues_list() TO public;
GRANT EXECUTE ON FUNCTION public.get_public_venues_list() TO anon;

-- Ensure the existing get_venue_contact_info function works properly
-- (This function already exists and restricts contact info to admins only)

-- Create a function to get a single venue's public data
CREATE OR REPLACE FUNCTION public.get_venue_public_data(venue_id uuid)
RETURNS TABLE(
  id uuid, 
  name text, 
  address text, 
  city text, 
  state text, 
  capacity integer,
  description text,
  website_url text,
  facilities text[],
  parking_available boolean,
  accessibility_features text[],
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return specific venue WITHOUT contact information for public access
  RETURN QUERY
  SELECT 
    v.id, v.name, v.address, v.city, v.state, v.capacity, v.description,
    v.website_url, v.facilities, v.parking_available, v.accessibility_features,
    v.created_at, v.updated_at
  FROM public.venues v
  WHERE v.id = venue_id;
END;
$$;

-- Grant execute permission to public and anon roles
GRANT EXECUTE ON FUNCTION public.get_venue_public_data(uuid) TO public;
GRANT EXECUTE ON FUNCTION public.get_venue_public_data(uuid) TO anon;