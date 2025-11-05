-- Script para agregar restricciones de clave foránea a la tabla mibarber_descansos_extra

-- Agregar restricción de clave foránea para id_barberia
DO $$ 
BEGIN
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
END $$;

-- Agregar restricción de clave foránea para id_sucursal
DO $$ 
BEGIN
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
END $$;

-- Agregar restricción de clave foránea para id_barbero
DO $$ 
BEGIN
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