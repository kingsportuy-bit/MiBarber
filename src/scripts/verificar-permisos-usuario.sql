-- Script para verificar los permisos del usuario actual

-- 1. Verificar el usuario actual
SELECT current_user, session_user;

-- 2. Verificar los roles del usuario
SELECT rolname FROM pg_roles WHERE rolname = current_user;

-- 3. Verificar los privilegios en la tabla mibarber_descansos_extra
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'mibarber_descansos_extra'
AND grantee = current_user;

-- 4. Verificar si el usuario es superusuario
SELECT 
    rolname,
    rolsuper
FROM pg_roles
WHERE rolname = current_user;

-- 5. Verificar el estado de autenticación
SELECT auth.uid() as user_id, auth.role() as user_role;

-- 6. Verificar si el usuario tiene acceso a las tablas relacionadas
SELECT 
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('mibarber_barberias', 'mibarber_sucursales', 'mibarber_barberos')
AND grantee = current_user;