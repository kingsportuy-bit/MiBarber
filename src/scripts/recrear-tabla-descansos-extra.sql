-- Script para restablecer y recrear la tabla mibarber_descansos_extra

-- ADVERTENCIA: Este script eliminará todos los datos existentes en la tabla
-- Hacer backup si es necesario antes de ejecutar

-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "Admins pueden ver todos los descansos de su barbería" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Admins pueden crear descansos en su barbería" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Admins pueden actualizar descansos en su barbería" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Admins pueden eliminar descansos en su barbería" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Barberos pueden ver sus propios descansos" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Barberos pueden crear sus propios descansos" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Barberos pueden actualizar sus propios descansos" ON public.mibarber_descansos_extra;
DROP POLICY IF EXISTS "Barberos pueden eliminar sus propios descansos" ON public.mibarber_descansos_extra;

-- 2. Deshabilitar temporalmente RLS
ALTER TABLE public.mibarber_descansos_extra DISABLE ROW LEVEL SECURITY;

-- 3. Eliminar restricciones de clave foránea
ALTER TABLE public.mibarber_descansos_extra 
DROP CONSTRAINT IF EXISTS fk_descanso_barberia;

ALTER TABLE public.mibarber_descansos_extra 
DROP CONSTRAINT IF EXISTS fk_descanso_sucursal;

ALTER TABLE public.mibarber_descansos_extra 
DROP CONSTRAINT IF EXISTS fk_descanso_barbero;

-- 4. Eliminar restricciones de validación
ALTER TABLE public.mibarber_descansos_extra 
DROP CONSTRAINT IF EXISTS chk_horas_validas;

ALTER TABLE public.mibarber_descansos_extra 
DROP CONSTRAINT IF EXISTS chk_dias_semana_formato;

-- 5. Recrear la tabla con la estructura correcta
CREATE TABLE IF NOT EXISTS public.mibarber_descansos_extra (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_barberia UUID NOT NULL,
    id_sucursal UUID NOT NULL,
    id_barbero UUID NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    dias_semana TEXT NOT NULL, -- Array de booleanos en formato JSON
    motivo TEXT,
    creado_por UUID NOT NULL,
    creado_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Agregar restricciones de clave foránea
ALTER TABLE public.mibarber_descansos_extra
    ADD CONSTRAINT fk_descanso_barberia 
        FOREIGN KEY (id_barberia) 
        REFERENCES public.mibarber_barberias(id) 
        ON DELETE CASCADE;

ALTER TABLE public.mibarber_descansos_extra
    ADD CONSTRAINT fk_descanso_sucursal 
        FOREIGN KEY (id_sucursal) 
        REFERENCES public.mibarber_sucursales(id) 
        ON DELETE CASCADE;

ALTER TABLE public.mibarber_descansos_extra
    ADD CONSTRAINT fk_descanso_barbero 
        FOREIGN KEY (id_barbero) 
        REFERENCES public.mibarber_barberos(id_barbero) 
        ON DELETE CASCADE;

-- 7. Agregar restricciones de validación
ALTER TABLE public.mibarber_descansos_extra
    ADD CONSTRAINT chk_horas_validas 
        CHECK (hora_inicio < hora_fin);

ALTER TABLE public.mibarber_descansos_extra
    ADD CONSTRAINT chk_dias_semana_formato 
        CHECK (dias_semana IS NOT NULL);

-- 8. Crear índices
CREATE INDEX IF NOT EXISTS idx_descansos_extra_barberia ON public.mibarber_descansos_extra(id_barberia);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_sucursal ON public.mibarber_descansos_extra(id_sucursal);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_barbero ON public.mibarber_descansos_extra(id_barbero);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_creado_at ON public.mibarber_descansos_extra(creado_at DESC);

-- 9. Habilitar RLS
ALTER TABLE public.mibarber_descansos_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mibarber_descansos_extra FORCE ROW LEVEL SECURITY;

-- 10. Crear políticas RLS corregidas

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

-- 11. Conceder permisos a la tabla
GRANT ALL ON TABLE public.mibarber_descansos_extra TO authenticated;