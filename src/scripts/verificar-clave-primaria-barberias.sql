-- Verificar clave primaria de mibarber_barberias
SELECT 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY' 
AND tc.table_name = 'mibarber_barberias'
AND tc.table_schema = 'public';