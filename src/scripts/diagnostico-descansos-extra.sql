-- Script de diagnóstico completo para la tabla mibarber_descansos_extra

-- 1. Verificar la estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'mibarber_descansos_extra'
ORDER BY ordinal_position;

-- 2. Verificar las políticas RLS
SELECT 
    polname as policyname,
    polpermissive as permissive,
    polroles as roles,
    polcmd as cmd,
    polqual as qual,
    polwithcheck as with_check
FROM pg_policy
WHERE polrelid = 'mibarber_descansos_extra'::regclass;

-- 3. Verificar si RLS está habilitado
SELECT 
    relname,
    relrowsecurity
FROM pg_class
WHERE relname = 'mibarber_descansos_extra';

-- 4. Verificar triggers
SELECT 
    tgname as trigger_name,
    tgtype as trigger_type,
    tgenabled as enabled,
    tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgrelid = 'mibarber_descansos_extra'::regclass;

-- 5. Verificar datos existentes
SELECT COUNT(*) as total_registros FROM public.mibarber_descansos_extra;

-- 6. Verificar estructura de mibarber_barberos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'mibarber_barberos'
ORDER BY ordinal_position;

-- 7. Verificar un barbero de prueba (reemplazar con un ID real)
-- SELECT * FROM public.mibarber_barberos WHERE id_barbero = 'ID_DE_BARBERO_REAL';

-- 8. Intentar insertar un registro de prueba (descomentar y reemplazar valores)
/*
INSERT INTO public.mibarber_descansos_extra (
    id_barberia,
    id_sucursal,
    id_barbero,
    hora_inicio,
    hora_fin,
    dias_semana,
    motivo,
    creado_por
) VALUES (
    'ID_DE_BABERIA_REAL',
    'ID_DE_SUCURSAL_REAL',
    'ID_DE_BARBERO_REAL',
    '09:00',
    '09:30',
    '[true,true,true,true,true,false,false]',
    'Prueba de descanso',
    'ID_DE_BARBERO_REAL'
);
*/