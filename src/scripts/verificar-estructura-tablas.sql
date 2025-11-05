-- Script para verificar la estructura de las tablas relacionadas y encontrar las columnas de clave primaria

-- Verificar las columnas y claves primarias de mibarber_barberias
SELECT 
    c.column_name, 
    c.data_type, 
    c.is_nullable,
    c.column_default,
    tc.constraint_type
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu 
    ON c.table_name = kcu.table_name 
    AND c.table_schema = kcu.table_schema
    AND c.column_name = kcu.column_name
LEFT JOIN information_schema.table_constraints tc 
    ON kcu.constraint_name = tc.constraint_name
    AND kcu.table_schema = tc.table_schema
WHERE c.table_name = 'mibarber_barberias' 
AND c.table_schema = 'public'
ORDER BY c.ordinal_position;

-- Verificar las columnas y claves primarias de mibarber_sucursales
SELECT 
    c.column_name, 
    c.data_type, 
    c.is_nullable,
    c.column_default,
    tc.constraint_type
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu 
    ON c.table_name = kcu.table_name 
    AND c.table_schema = kcu.table_schema
    AND c.column_name = kcu.column_name
LEFT JOIN information_schema.table_constraints tc 
    ON kcu.constraint_name = tc.constraint_name
    AND kcu.table_schema = tc.table_schema
WHERE c.table_name = 'mibarber_sucursales' 
AND c.table_schema = 'public'
ORDER BY c.ordinal_position;

-- Verificar las columnas y claves primarias de mibarber_barberos
SELECT 
    c.column_name, 
    c.data_type, 
    c.is_nullable,
    c.column_default,
    tc.constraint_type
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu 
    ON c.table_name = kcu.table_name 
    AND c.table_schema = kcu.table_schema
    AND c.column_name = kcu.column_name
LEFT JOIN information_schema.table_constraints tc 
    ON kcu.constraint_name = tc.constraint_name
    AND kcu.table_schema = tc.table_schema
WHERE c.table_name = 'mibarber_barberos' 
AND c.table_schema = 'public'
ORDER BY c.ordinal_position;