-- Verificar si hay datos en la tabla mibarber_descansos_extra
SELECT COUNT(*) as total_registros FROM public.mibarber_descansos_extra;

-- Verificar la estructura de algunos registros de ejemplo
SELECT * FROM public.mibarber_descansos_extra LIMIT 5;