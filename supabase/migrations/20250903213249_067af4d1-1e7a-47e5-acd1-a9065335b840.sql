-- Primeiro, vamos ver produtos duplicados
SELECT slug, COUNT(*) as count 
FROM products 
WHERE status = 'published' 
GROUP BY slug 
HAVING COUNT(*) > 1;