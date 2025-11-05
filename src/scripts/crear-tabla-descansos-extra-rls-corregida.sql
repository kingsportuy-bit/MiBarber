-- Script corregido para crear la tabla mibarber_descansos_extra con políticas RLS adecuadas

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

-- NOTA: Las políticas RLS se agregarán después de verificar la estructura de la tabla mibarber_barberos
-- para determinar el nombre correcto de la columna que contiene el ID de usuario.

-- Conceder permisos a la tabla
GRANT ALL ON TABLE public.mibarber_descansos_extra TO authenticated;