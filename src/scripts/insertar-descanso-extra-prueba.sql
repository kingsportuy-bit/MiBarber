-- Insertar un registro de prueba en la tabla mibarber_descansos_extra
-- (Reemplazar los valores con IDs reales de tu base de datos)

INSERT INTO public.mibarber_descansos_extra (
    id_barberia,
    id_sucursal,
    id_barbero,
    hora_inicio,
    hora_fin,
    dias_semana,
    motivo,
    creado_por
) VALUES (
    'ID_DE_BABERIA_REAL',  -- Reemplazar con un ID de barbería real
    'ID_DE_SUCURSAL_REAL',  -- Reemplazar con un ID de sucursal real
    'ID_DE_BARBERO_REAL',  -- Reemplazar con un ID de barbero real
    '09:00',
    '09:30',
    '[true,true,true,true,true,false,false]',
    'Prueba de descanso',
    'ID_DE_BARBERO_REAL'  -- Reemplazar con el mismo ID de barbero
);