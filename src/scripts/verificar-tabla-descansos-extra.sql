-- Script para verificar la estructura de la tabla mibarber_descansos_extra
-- Este script puede ejecutarse en el SQL Editor de Supabase

-- Verificar que la tabla exista
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'mibarber_descansos_extra'
);

-- Verificar la estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'mibarber_descansos_extra'
ORDER BY ordinal_position;

-- Verificar las restricciones de la tabla
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'mibarber_descansos_extra';

-- Verificar las políticas RLS
SELECT 
    polname as policyname,
    pc.relname as tablename,
    polroles as roles,
    polpermissive as permissive,
    polcmd as cmd,
    polqual as qual,
    polwithcheck as with_check
FROM pg_policy pol
JOIN pg_class pc ON pc.oid = pol.polrelid
WHERE pc.relname = 'mibarber_descansos_extra';