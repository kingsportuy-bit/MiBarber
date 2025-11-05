-- Script para verificar restricciones de clave foránea y datos relacionados

-- 1. Verificar las restricciones de clave foránea en mibarber_descansos_extra
SELECT
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name,
    af.attname as referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.conrelid = 'mibarber_descansos_extra'::regclass
AND c.contype = 'f';

-- 2. Verificar que existan registros en las tablas referenciadas
SELECT 'mibarber_barberias' as table_name, COUNT(*) as count FROM public.mibarber_barberias
UNION ALL
SELECT 'mibarber_sucursales' as table_name, COUNT(*) as count FROM public.mibarber_sucursales
UNION ALL
SELECT 'mibarber_barberos' as table_name, COUNT(*) as count FROM public.mibarber_barberos;

-- 3. Verificar un ejemplo de cada tabla referenciada
SELECT 'mibarber_barberias' as table_name, id as primary_key FROM public.mibarber_barberias LIMIT 1
UNION ALL
SELECT 'mibarber_sucursales' as table_name, id as primary_key FROM public.mibarber_sucursales LIMIT 1
UNION ALL
SELECT 'mibarber_barberos' as table_name, id_barbero as primary_key FROM public.mibarber_barberos LIMIT 1;

-- 4. Verificar que los IDs usados en el payload existan
-- Reemplazar con los IDs reales del error:
-- SELECT 'barberia_exists' as check_type, COUNT(*) as count FROM public.mibarber_barberias WHERE id = '484e9af7-8c57-43e7-97a1-355c44189e15'
-- UNION ALL
-- SELECT 'sucursal_exists' as check_type, COUNT(*) as count FROM public.mibarber_sucursales WHERE id = '484e9af7-8c57-43e7-97a1-355c44189e15'
-- UNION ALL
-- SELECT 'barbero_exists' as check_type, COUNT(*) as count FROM public.mibarber_barberos WHERE id_barbero = 'f7a5a045-9f5e-4944-9fab-e19cc07e45f7';

-- 5. Verificar que el barbero pertenezca a la barbería y sucursal
-- SELECT b.nombre as barbero, bar.id as barberia, s.id as sucursal
-- FROM public.mibarber_barberos b
-- JOIN public.mibarber_barberias bar ON b.id_barberia = bar.id
-- JOIN public.mibarber_sucursales s ON b.id_sucursal = s.id
-- WHERE b.id_barbero = 'f7a5a045-9f5e-4944-9fab-e19cc07e45f7';