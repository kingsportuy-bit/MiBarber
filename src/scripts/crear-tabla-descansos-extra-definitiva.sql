-- Script definitivo para crear la tabla mibarber_descansos_extra con todas las restricciones y políticas RLS

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
    activo BOOLEAN DEFAULT true,
    creado_por UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
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
                REFERENCES public.mibarber_barberias(id) 
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
                REFERENCES public.mibarber_sucursales(id) 
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
    
    -- Restricción para creado_por
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_descanso_creado_por' 
        AND table_name = 'mibarber_descansos_extra'
    ) THEN
        ALTER TABLE public.mibarber_descansos_extra
            ADD CONSTRAINT fk_descanso_creado_por 
                FOREIGN KEY (creado_por) 
                REFERENCES public.mibarber_usuarios(id) 
                ON DELETE CASCADE;
    END IF;
END $$;

-- Agregar restricciones de validación
DO $$ 
BEGIN
    -- Validar que la hora de inicio sea menor que la hora de fin
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_horas_validas' 
        AND table_name = 'mibarber_descansos_extra'
    ) THEN
        ALTER TABLE public.mibarber_descansos_extra
            ADD CONSTRAINT chk_horas_validas 
                CHECK (hora_inicio < hora_fin);
    END IF;
END $$;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_descansos_extra_barberia ON public.mibarber_descansos_extra(id_barberia);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_sucursal ON public.mibarber_descansos_extra(id_sucursal);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_barbero ON public.mibarber_descansos_extra(id_barbero);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_activo ON public.mibarber_descansos_extra(activo);
CREATE INDEX IF NOT EXISTS idx_descansos_extra_creado ON public.mibarber_descansos_extra(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.mibarber_descansos_extra ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
-- Los administradores pueden ver todos los descansos
CREATE POLICY "Administradores pueden ver todos los descansos" 
ON public.mibarber_descansos_extra 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b
        JOIN public.mibarber_usuarios u ON b.id_usuario = u.id
        WHERE b.id_barbero = id_barbero 
        AND u.nivel_permisos >= 3
        AND u.id = auth.uid()
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

-- Los administradores pueden insertar descansos para cualquier barbero
CREATE POLICY "Administradores pueden insertar descansos" 
ON public.mibarber_descansos_extra 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b
        JOIN public.mibarber_usuarios u ON b.id_usuario = u.id
        WHERE b.id_barbero = id_barbero 
        AND u.nivel_permisos >= 3
        AND u.id = auth.uid()
    )
);

-- Los barberos pueden insertar sus propios descansos
CREATE POLICY "Barberos pueden insertar sus propios descansos" 
ON public.mibarber_descansos_extra 
FOR INSERT 
TO authenticated 
WITH CHECK (
    id_barbero IN (
        SELECT id_barbero FROM public.mibarber_barberos 
        WHERE id_usuario = auth.uid()
    )
);

-- Los administradores pueden actualizar cualquier descanso
CREATE POLICY "Administradores pueden actualizar cualquier descanso" 
ON public.mibarber_descansos_extra 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b
        JOIN public.mibarber_usuarios u ON b.id_usuario = u.id
        WHERE b.id_barbero = id_barbero 
        AND u.nivel_permisos >= 3
        AND u.id = auth.uid()
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

-- Los administradores pueden eliminar cualquier descanso
CREATE POLICY "Administradores pueden eliminar cualquier descanso" 
ON public.mibarber_descansos_extra 
FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.mibarber_barberos b
        JOIN public.mibarber_usuarios u ON b.id_usuario = u.id
        WHERE b.id_barbero = id_barbero 
        AND u.nivel_permisos >= 3
        AND u.id = auth.uid()
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