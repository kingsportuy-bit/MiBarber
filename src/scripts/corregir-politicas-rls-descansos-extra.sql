-- Corregir las políticas RLS de la tabla mibarber_descansos_extra

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Admins pueden ver todos los descansos de su barbería" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Admins pueden crear descansos en su barbería" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Admins pueden actualizar descansos en su barbería" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Admins pueden eliminar descansos en su barbería" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Barberos pueden ver sus propios descansos" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Barberos pueden crear sus propios descansos" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Barberos pueden actualizar sus propios descansos" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Barberos pueden eliminar sus propios descansos" ON public.mibarber_descansos_extra;

-- Crear nuevas políticas corregidas

-- Los administradores pueden ver todos los descansos de su barbería
CREATE POLICY "Admins pueden ver todos los descansos de su barbería" 
ON public.mibarber_descansos_extra 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barberia = mibarber_descansos_extra.id_barberia 
        AND b.admin = true
        AND b.activo = true
    )
);

-- Los administradores pueden crear descansos en su barbería
CREATE POLICY "Admins pueden crear descansos en su barbería" 
ON public.mibarber_descansos_extra 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barberia = mibarber_descansos_extra.id_barberia 
        AND b.admin = true
        AND b.activo = true
    )
);

-- Los administradores pueden actualizar descansos en su barbería
CREATE POLICY "Admins pueden actualizar descansos en su barbería" 
ON public.mibarber_descansos_extra 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barberia = mibarber_descansos_extra.id_barberia 
        AND b.admin = true
        AND b.activo = true
    )
);

-- Los administradores pueden eliminar descansos en su barbería
CREATE POLICY "Admins pueden eliminar descansos en su barbería" 
ON public.mibarber_descansos_extra 
FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barberia = mibarber_descansos_extra.id_barberia 
        AND b.admin = true
        AND b.activo = true
    )
);

-- Los barberos pueden ver sus propios descansos
CREATE POLICY "Barberos pueden ver sus propios descansos" 
ON public.mibarber_descansos_extra 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barbero = mibarber_descansos_extra.id_barbero 
        AND b.activo = true
    )
);

-- Los barberos pueden crear sus propios descansos
CREATE POLICY "Barberos pueden crear sus propios descansos" 
ON public.mibarber_descansos_extra 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barbero = mibarber_descansos_extra.id_barbero 
        AND b.activo = true
    )
);

-- Los barberos pueden actualizar sus propios descansos
CREATE POLICY "Barberos pueden actualizar sus propios descansos" 
ON public.mibarber_descansos_extra 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barbero = mibarber_descansos_extra.id_barbero 
        AND b.activo = true
    )
);

-- Los barberos pueden eliminar sus propios descansos
CREATE POLICY "Barberos pueden eliminar sus propios descansos" 
ON public.mibarber_descansos_extra 
FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barbero = mibarber_descansos_extra.id_barbero 
        AND b.activo = true
    )
);