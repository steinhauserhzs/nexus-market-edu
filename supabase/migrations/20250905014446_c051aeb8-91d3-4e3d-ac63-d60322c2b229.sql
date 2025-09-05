-- Enhanced Security Tables and Functions

-- Create enhanced security audit table for comprehensive logging
CREATE TABLE IF NOT EXISTS public.security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security audit table
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- Only system can insert into security audit
CREATE POLICY "System can insert security audit logs" ON public.security_audit
FOR INSERT WITH CHECK (true);

-- Only admins can view security audit logs
CREATE POLICY "Admins can view security audit logs" ON public.security_audit
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create data retention policy table
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL,
  retention_field TEXT NOT NULL DEFAULT 'created_at',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default retention policies
INSERT INTO public.data_retention_policies (table_name, retention_days, retention_field) VALUES
('product_views', 365, 'created_at'),
('cart_analytics', 730, 'created_at'),
('security_logs', 1095, 'created_at'), -- 3 years
('rate_limits', 30, 'created_at'),
('security_audit', 2555, 'created_at'); -- 7 years for compliance

-- Function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_table_name TEXT,
  p_action TEXT,
  p_record_id TEXT DEFAULT NULL,
  p_risk_level TEXT DEFAULT 'medium'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit (
    user_id,
    action,
    table_name,
    record_id,
    risk_level,
    details,
    ip_address,
    session_id
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_risk_level,
    jsonb_build_object(
      'timestamp', now(),
      'auth_role', current_setting('request.jwt.claim.role', true),
      'auth_email', current_setting('request.jwt.claim.email', true)
    ),
    inet(current_setting('request.headers', true)::json->>'x-real-ip'),
    current_setting('request.jwt.claim.session_id', true)
  );
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the main operation if audit logging fails
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced profiles table with data minimization
-- Add consent tracking and data classification
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_consent_given BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_consent_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('private', 'public', 'limited'));

-- Create trigger to log profile access
CREATE OR REPLACE FUNCTION public.log_profile_access() RETURNS TRIGGER AS $$
BEGIN
  -- Log profile data access
  PERFORM public.log_sensitive_data_access(
    'profiles',
    TG_OP,
    NEW.id::TEXT,
    CASE 
      WHEN TG_OP = 'SELECT' THEN 'low'
      WHEN TG_OP = 'UPDATE' THEN 'medium'
      ELSE 'high'
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile access logging
DROP TRIGGER IF EXISTS log_profile_access_trigger ON public.profiles;
CREATE TRIGGER log_profile_access_trigger
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_access();

-- Enhanced financial data protection
-- Add triggers to log financial data access
CREATE OR REPLACE FUNCTION public.log_financial_access() RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_sensitive_data_access(
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    'high' -- Financial data is always high risk
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers to financial tables
DROP TRIGGER IF EXISTS log_orders_access ON public.orders;
CREATE TRIGGER log_orders_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_financial_access();

DROP TRIGGER IF EXISTS log_transactions_access ON public.transactions;
CREATE TRIGGER log_transactions_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.log_financial_access();

-- Create function to clean up old data based on retention policies
CREATE OR REPLACE FUNCTION public.cleanup_old_data() RETURNS INTEGER AS $$
DECLARE
  policy_record RECORD;
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  FOR policy_record IN 
    SELECT table_name, retention_days, retention_field 
    FROM public.data_retention_policies 
    WHERE active = true
  LOOP
    -- Use dynamic SQL to delete old records
    EXECUTE format(
      'DELETE FROM public.%I WHERE %I < now() - INTERVAL ''%s days''',
      policy_record.table_name,
      policy_record.retention_field,
      policy_record.retention_days
    );
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Log cleanup activity
    PERFORM public.log_sensitive_data_access(
      policy_record.table_name,
      'CLEANUP',
      NULL,
      'low'
    );
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced consent management functions
CREATE OR REPLACE FUNCTION public.update_user_consent(
  p_data_consent BOOLEAN DEFAULT NULL,
  p_marketing_consent BOOLEAN DEFAULT NULL,
  p_processing_consent BOOLEAN DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  UPDATE public.profiles SET
    data_consent_given = COALESCE(p_data_consent, data_consent_given),
    data_consent_date = CASE WHEN p_data_consent IS NOT NULL THEN now() ELSE data_consent_date END,
    marketing_consent = COALESCE(p_marketing_consent, marketing_consent),
    data_processing_consent = COALESCE(p_processing_consent, data_processing_consent),
    updated_at = now()
  WHERE id = user_id;
  
  -- Log consent changes
  PERFORM public.log_sensitive_data_access(
    'profiles',
    'CONSENT_UPDATE',
    user_id::TEXT,
    'medium'
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export user data (LGPD compliance)
CREATE OR REPLACE FUNCTION public.export_user_data()
RETURNS JSONB AS $$
DECLARE
  user_id UUID;
  user_data JSONB := '{}';
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Log data export request
  PERFORM public.log_sensitive_data_access(
    'profiles',
    'DATA_EXPORT',
    user_id::TEXT,
    'high'
  );
  
  -- Collect user data from various tables
  SELECT jsonb_build_object(
    'profile', to_jsonb(p.*),
    'orders', COALESCE(order_data.orders, '[]'::jsonb),
    'licenses', COALESCE(license_data.licenses, '[]'::jsonb),
    'export_date', now()
  ) INTO user_data
  FROM public.profiles p
  LEFT JOIN (
    SELECT o.user_id, jsonb_agg(to_jsonb(o.*)) as orders
    FROM public.orders o
    WHERE o.user_id = user_id
    GROUP BY o.user_id
  ) order_data ON order_data.user_id = p.id
  LEFT JOIN (
    SELECT l.user_id, jsonb_agg(to_jsonb(l.*)) as licenses
    FROM public.licenses l
    WHERE l.user_id = user_id
    GROUP BY l.user_id
  ) license_data ON license_data.user_id = p.id
  WHERE p.id = user_id;
  
  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance on security tables
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_risk_level ON public.security_audit(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_audit_table_name ON public.security_audit(table_name);

-- Schedule automatic cleanup (this would typically be done with pg_cron in production)
COMMENT ON FUNCTION public.cleanup_old_data() IS 'Run this function periodically to clean up old data based on retention policies';