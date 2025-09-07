-- Fix infinite recursion in order_items RLS policy
-- First, create a security definer function to safely check order permissions
CREATE OR REPLACE FUNCTION public.user_can_access_order_item(item_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result boolean := false;
BEGIN
  -- Check if user owns the order
  SELECT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = item_order_id AND o.user_id = auth.uid()
  ) INTO result;
  
  -- If not order owner, check if user owns the store for the product
  IF NOT result THEN
    SELECT EXISTS (
      SELECT 1 
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN stores s ON s.id = p.store_id
      WHERE oi.order_id = item_order_id AND s.owner_id = auth.uid()
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$;

-- Drop existing problematic policies on order_items
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Store owners can view order items for their products" ON public.order_items;

-- Create new safe policies using the security definer function
CREATE POLICY "Users can view accessible order items" 
ON public.order_items 
FOR SELECT 
USING (public.user_can_access_order_item(order_id));

-- Create RLS policies for store_assets storage bucket
CREATE POLICY "Store owners can manage their assets" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'store-assets' AND 
  EXISTS (
    SELECT 1 FROM stores s
    WHERE s.owner_id = auth.uid() 
    AND (storage.foldername(name))[1] = s.id::text
  )
);

CREATE POLICY "Licensed users can view store assets" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'store-assets' AND 
  EXISTS (
    SELECT 1 
    FROM stores s
    JOIN products p ON p.store_id = s.id
    JOIN licenses l ON l.product_id = p.id
    WHERE l.user_id = auth.uid() 
    AND l.is_active = true
    AND (storage.foldername(name))[1] = s.id::text
  )
);

-- Create secure functions for event contact info access
CREATE OR REPLACE FUNCTION public.get_event_public_data(event_id uuid)
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

-- Create secure function for venue public data (without contact info)
CREATE OR REPLACE FUNCTION public.get_venue_public_data(venue_id uuid)
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- Update existing functions to have proper search_path settings
CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_details jsonb DEFAULT NULL::jsonb, p_user_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_logs (user_id, action, details)
    VALUES (
        COALESCE(p_user_id, auth.uid()),
        p_action,
        p_details
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Add security logging for asset access
CREATE OR REPLACE FUNCTION public.log_asset_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to store assets
  IF NEW.bucket_id = 'store-assets' THEN
    PERFORM public.log_security_event(
      'store_asset_access',
      jsonb_build_object(
        'asset_name', NEW.name,
        'store_folder', (storage.foldername(NEW.name))[1]
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for asset access logging
DROP TRIGGER IF EXISTS log_store_asset_access ON storage.objects;
CREATE TRIGGER log_store_asset_access
  AFTER SELECT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'store-assets')
  EXECUTE FUNCTION public.log_asset_access();

-- Add data retention policy for security logs (90 days)
INSERT INTO public.data_retention_policies (table_name, retention_days, retention_field, active)
VALUES ('security_logs', 90, 'created_at', true)
ON CONFLICT (table_name) DO UPDATE SET
  retention_days = 90,
  active = true,
  updated_at = now();

-- Add data retention policy for security audit logs (365 days)  
INSERT INTO public.data_retention_policies (table_name, retention_days, retention_field, active)
VALUES ('security_audit', 365, 'created_at', true)
ON CONFLICT (table_name) DO UPDATE SET
  retention_days = 365,
  active = true,
  updated_at = now();