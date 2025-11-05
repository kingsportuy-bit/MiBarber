-- Script para verificar la estructura de las tablas relacionadas
-- Verificar estructura de mibarber_barberias
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'mibarber_barberias' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de mibarber_sucursales
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'mibarber_sucursales' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de mibarber_barberos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'mibarber_barberos' 
AND table_schema = 'public'
ORDER BY ordinal_position;