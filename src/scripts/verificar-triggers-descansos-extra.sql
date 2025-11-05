-- Verificar si hay triggers en la tabla mibarber_descansos_extra
SELECT 
    tgname as trigger_name,
    tgtype as trigger_type,
    tgenabled as enabled,
    tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgrelid = 'mibarber_descansos_extra'::regclass;

-- Verificar si hay funciones relacionadas con la tabla
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc
WHERE proname ILIKE '%descanso%';