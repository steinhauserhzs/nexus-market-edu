-- Corrigir função com search_path seguro
CREATE OR REPLACE FUNCTION cleanup_old_upload_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.upload_sessions 
  WHERE created_at < (now() - INTERVAL '24 hours') 
  AND status != 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;