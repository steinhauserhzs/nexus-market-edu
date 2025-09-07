-- Add enhanced security audit table
CREATE TABLE IF NOT EXISTS public.security_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id text,
  risk_level text DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security_audit
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Only admins can view security audit" 
ON public.security_audit FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit FOR INSERT
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_risk_level ON public.security_audit(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit(user_id);

-- Add rate limiting table for enhanced security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- System only access to rate limits
CREATE POLICY "System only rate limits" 
ON public.rate_limits FOR ALL
USING (false)
WITH CHECK (false);

-- Index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(identifier, action, window_start);

-- Add file upload audit table
CREATE TABLE IF NOT EXISTS public.file_upload_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  sanitized_name text,
  security_warnings text[],
  upload_status text DEFAULT 'pending' CHECK (upload_status IN ('pending', 'approved', 'rejected', 'completed')),
  rejection_reason text,
  file_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on file_upload_audit
ALTER TABLE public.file_upload_audit ENABLE ROW LEVEL SECURITY;

-- Users can view their own upload history
CREATE POLICY "Users can view own upload audit" 
ON public.file_upload_audit FOR SELECT
USING (user_id = auth.uid());

-- System can manage file upload audits
CREATE POLICY "System can manage upload audits" 
ON public.file_upload_audit FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can view all upload audits
CREATE POLICY "Admins can view all upload audits" 
ON public.file_upload_audit FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

-- Function to clean old security logs
CREATE OR REPLACE FUNCTION public.cleanup_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete security logs older than 90 days
  DELETE FROM public.security_logs 
  WHERE created_at < (now() - INTERVAL '90 days');
  
  -- Delete rate limit records older than 24 hours
  DELETE FROM public.rate_limits 
  WHERE created_at < (now() - INTERVAL '24 hours');
  
  -- Delete old security audit records (keep 1 year)
  DELETE FROM public.security_audit 
  WHERE created_at < (now() - INTERVAL '1 year');
  
  -- Delete old file upload audits (keep 6 months)
  DELETE FROM public.file_upload_audit 
  WHERE created_at < (now() - INTERVAL '6 months');
END;
$$;