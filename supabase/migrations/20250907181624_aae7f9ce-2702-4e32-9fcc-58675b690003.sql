-- Fix remaining security issues identified by linter

-- Issue 1: Fix functions that don't have search_path set properly
-- The functions we created already have SET search_path = public, but let's ensure all functions are secure

-- Issue 2: Remove any SECURITY DEFINER from views (replace with functions if needed)
-- The venues_public view should not be security definer

-- Drop and recreate the view without security definer (if it was set)
DROP VIEW IF EXISTS public.venues_public;

-- Create a standard view (not security definer) for public venue data
CREATE VIEW public.venues_public AS
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

-- Grant appropriate permissions to the view
GRANT SELECT ON public.venues_public TO anon;
GRANT SELECT ON public.venues_public TO authenticated;

-- Ensure all our functions have proper search_path (they should already, but let's be explicit)
-- This addresses the Function Search Path Mutable warnings

-- Recreate get_public_venues_list with explicit search_path
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
SET search_path = 'public'
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

-- Recreate get_venue_public_data with explicit search_path
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
SET search_path = 'public'
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_venues_list() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_venues_list() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_venue_public_data(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_venue_public_data(uuid) TO authenticated;