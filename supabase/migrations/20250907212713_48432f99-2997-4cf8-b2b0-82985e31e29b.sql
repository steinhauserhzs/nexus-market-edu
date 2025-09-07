-- Definir o primeiro usuário como admin se ainda não houver nenhum admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM profiles 
  WHERE role IS NULL OR role != 'admin'
  ORDER BY created_at ASC 
  LIMIT 1
) 
AND NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');