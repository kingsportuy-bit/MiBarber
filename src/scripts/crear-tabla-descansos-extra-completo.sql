-- Script completo para crear la tabla mibarber_descansos_extra con todas las restricciones

-- Crear la tabla si no existe
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

-- Agregar restricciones de clave foránea
DO $$ 
BEGIN
    -- Restricción para id_barberia
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_descanso_barberia' 
        AND table_name = 'mibarber_descansos_extra'
    ) THEN
        ALTER TABLE public.mibarber_descansos_extra
            ADD CONSTRAINT fk_descanso_barberia 
                FOREIGN KEY (id_barberia) 
                REFERENCES public.mibarber_barberias(id_barberia) 
                ON DELETE CASCADE;
    END IF;
    
    -- Restricción para id_sucursal
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_descanso_sucursal' 
        AND table_name = 'mibarber_descansos_extra'
    ) THEN
        ALTER TABLE public.mibarber_descansos_extra
            ADD CONSTRAINT fk_descanso_sucursal 
                FOREIGN KEY (id_sucursal) 
                REFERENCES public.mibarber_sucursales(id_sucursal) 
                ON DELETE CASCADE;
    END IF;
    
    -- Restricción para id_barbero
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_descanso_barbero' 
        AND table_name = 'mibarber_descansos_extra'
    ) THEN
        ALTER TABLE public.mibarber_descansos_extra
            ADD CONSTRAINT fk_descanso_barbero 
                FOREIGN KEY (id_barbero) 
                REFERENCES public.mibarber_barberos(id_barbero) 
                ON DELETE CASCADE;
    END IF;
END $$;

-- Agregar restricciones de validación
DO $$ 
BEGIN
    -- Validar que hora_inicio < hora_fin
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_horas_validas' 
        AND table_name = 'mibarber_descansos_extra'
    ) THEN
        ALTER TABLE public.mibarber_descansos_extra
            ADD CONSTRAINT chk_horas_validas 
                CHECK (hora_inicio < hora_fin);
    END IF;
    
    -- Validar que dias_semana no sea NULL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_dias_semana_formato' 
        AND table_name = 'mibarber_descansos_extra'
    ) THEN
        ALTER TABLE public.mibarber_descansos_extra
            ADD CONSTRAINT chk_dias_semana_formato 
                CHECK (dias_semana IS NOT NULL);
    END IF;
END $$;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_descansos_extra_barberia ON public.mibarber_descansos_extra(id_barberia);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_sucursal ON public.mibarber_descansos_extra(id_sucursal);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_barbero ON public.mibarber_descansos_extra(id_barbero);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_creado_at ON public.mibarber_descansos_extra(creado_at DESC);

-- Habilitar Row Level Security
ALTER TABLE public.mibarber_descansos_extra ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Los administradores pueden ver y modificar todos los descansos de su barbería
CREATE POLICY "Admins pueden ver todos los descansos de su barbería" 
ON public.mibarber_descansos_extra 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barberia = mibarber_descansos_extra.id_barberia 
        AND b.id_usuario = auth.uid() 
        AND b.rol = 'admin'
    )
);

CREATE POLICY "Admins pueden crear descansos en su barbería" 
ON public.mibarber_descansos_extra 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barberia = mibarber_descansos_extra.id_barberia 
        AND b.id_usuario = auth.uid() 
        AND b.rol = 'admin'
    )
);

CREATE POLICY "Admins pueden actualizar descansos en su barbería" 
ON public.mibarber_descansos_extra 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barberia = mibarber_descansos_extra.id_barberia 
        AND b.id_usuario = auth.uid() 
        AND b.rol = 'admin'
    )
);

CREATE POLICY "Admins pueden eliminar descansos en su barbería" 
ON public.mibarber_descansos_extra 
FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b 
        WHERE b.id_barberia = mibarber_descansos_extra.id_barberia 
        AND b.id_usuario = auth.uid() 
        AND b.rol = 'admin'
    )
);

-- Los barberos pueden ver sus propios descansos
CREATE POLICY "Barberos pueden ver sus propios descansos" 
ON public.mibarber_descansos_extra 
FOR SELECT 
TO authenticated 
USING (
    id_barbero IN (
        SELECT id_barbero FROM public.mibarber_barberos 
        WHERE id_usuario = auth.uid()
    )
);

-- Los barberos pueden crear sus propios descansos
CREATE POLICY "Barberos pueden crear sus propios descansos" 
ON public.mibarber_descansos_extra 
FOR INSERT 
TO authenticated 
WITH CHECK (
    id_barbero IN (
        SELECT id_barbero FROM public.mibarber_barberos 
        WHERE id_usuario = auth.uid()
    )
);

-- Los barberos pueden actualizar sus propios descansos
CREATE POLICY "Barberos pueden actualizar sus propios descansos" 
ON public.mibarber_descansos_extra 
FOR UPDATE 
TO authenticated 
USING (
    id_barbero IN (
        SELECT id_barbero FROM public.mibarber_barberos 
        WHERE id_usuario = auth.uid()
    )
);

-- Los barberos pueden eliminar sus propios descansos
CREATE POLICY "Barberos pueden eliminar sus propios descansos" 
ON public.mibarber_descansos_extra 
FOR DELETE 
TO authenticated 
USING (
    id_barbero IN (
        SELECT id_barbero FROM public.mibarber_barberos 
        WHERE id_usuario = auth.uid()
    )
);

-- Conceder permisos a la tabla
GRANT ALL ON TABLE public.mibarber_descansos_extra TO authenticated;