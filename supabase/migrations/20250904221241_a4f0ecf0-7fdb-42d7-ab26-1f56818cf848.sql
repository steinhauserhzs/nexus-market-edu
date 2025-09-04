-- Create rate_limits table for rate limiting functionality
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  identifier TEXT NOT NULL, -- user_id or ip_address
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_action_identifier_created 
ON public.rate_limits (action, identifier, created_at);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Enhance security_logs table with additional fields
ALTER TABLE public.security_logs 
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'low',
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Update security_logs RLS to be more restrictive
DROP POLICY IF EXISTS "Users can view their own security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Admin can view all security logs" ON public.security_logs;

-- Only system and admins can access security logs
CREATE POLICY "System can manage security logs" 
ON public.security_logs 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Function to clean old rate limit entries (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < (now() - INTERVAL '24 hours');
END;
$$;

-- Function to get security analytics for admins
CREATE OR REPLACE FUNCTION public.get_security_analytics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT (now() - INTERVAL '30 days'),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS TABLE(
  action TEXT,
  severity TEXT,
  count BIGINT,
  latest_occurrence TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    sl.action,
    sl.severity,
    COUNT(*) as count,
    MAX(sl.created_at) as latest_occurrence
  FROM public.security_logs sl
  WHERE sl.created_at >= start_date 
    AND sl.created_at <= end_date
  GROUP BY sl.action, sl.severity
  ORDER BY count DESC, latest_occurrence DESC;
END;
$$;