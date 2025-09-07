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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_risk_level ON public.security_audit(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit(user_id);

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