-- Verificar las políticas RLS de la tabla mibarber_descansos_extra
SELECT 
    polname as policyname,
    polpermissive as permissive,
    polroles as roles,
    polcmd as cmd,
    polqual as qual,
    polwithcheck as with_check
FROM pg_policy
WHERE polrelid = 'mibarber_descansos_extra'::regclass;

-- Verificar si RLS está habilitado para la tabla
SELECT 
    relname,
    relrowsecurity
FROM pg_class
WHERE relname = 'mibarber_descansos_extra';