-- Set specific users as admins based on their UIDs from Supabase Auth Users table

-- Update profiles to set these users as admin
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE id IN (
  'd8bcfedb-8369-40e2-b099-80a520bc5742', -- darroesa forja
  '424ed23f-b0fc-4227-8d82-1dd9064f4cd0', -- DARROSSA  
  '2d6e19ed-23f7-4f23-aea0-4c029e3131e7'  -- haira zupanc steinhauser
);

-- Log admin assignment action
INSERT INTO public.admin_logs (
  admin_id,
  action,
  target_type,
  details
) VALUES (
  '2d6e19ed-23f7-4f23-aea0-4c029e3131e7', -- Current admin doing the action
  'BULK_ADMIN_ASSIGNMENT',
  'profiles',
  jsonb_build_object(
    'assigned_users', ARRAY[
      'd8bcfedb-8369-40e2-b099-80a520bc5742',
      '424ed23f-b0fc-4227-8d82-1dd9064f4cd0', 
      '2d6e19ed-23f7-4f23-aea0-4c029e3131e7'
    ],
    'reason', 'Bulk admin assignment via migration',
    'timestamp', now()
  )
);