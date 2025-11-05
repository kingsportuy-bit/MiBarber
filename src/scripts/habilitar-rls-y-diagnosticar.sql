-- Script para habilitar RLS y diagnosticar problemas con mibarber_descansos_extra

-- 1. Verificar el estado actual de RLS
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as force_rls
FROM pg_class
WHERE relname = 'mibarber_descansos_extra';

-- 2. Verificar las políticas existentes
SELECT 
    polname as policyname,
    polpermissive as permissive,
    polroles as roles,
    polcmd as cmd,
    polqual as qual,
    polwithcheck as with_check
FROM pg_policy
WHERE polrelid = 'mibarber_descansos_extra'::regclass;

-- 3. Habilitar RLS si no está habilitado
ALTER TABLE public.mibarber_descansos_extra ENABLE ROW LEVEL SECURITY;

-- 4. Forzar RLS para todos los usuarios, incluyendo superusuarios
ALTER TABLE public.mibarber_descansos_extra FORCE ROW LEVEL SECURITY;

-- 5. Verificar triggers de restricción
SELECT 
    tgname as trigger_name,
    tgtype as trigger_type,
    tgenabled as enabled,
    tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgrelid = 'mibarber_descansos_extra'::regclass;

-- 6. Verificar las restricciones de clave foránea
SELECT
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'mibarber_descansos_extra'::regclass
AND c.contype = 'f';

-- 7. Verificar datos de prueba (reemplazar con IDs reales)
-- SELECT * FROM public.mibarber_barberias WHERE id = 'ID_DE_BABERIA_REAL';
-- SELECT * FROM public.mibarber_sucursales WHERE id = 'ID_DE_SUCURSAL_REAL';
-- SELECT * FROM public.mibarber_barberos WHERE id_barbero = 'ID_DE_BARBERO_REAL';

-- 8. Intentar una inserción de prueba con valores reales
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
) RETURNING *;
*/