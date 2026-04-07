-- Agregar columnas de integración a mibarber_sucursales
ALTER TABLE public.mibarber_sucursales 
  ADD COLUMN IF NOT EXISTS instance_name TEXT,
  ADD COLUMN IF NOT EXISTS inbox_id INTEGER,
  ADD COLUMN IF NOT EXISTS id_conv_notificaciones BIGINT;

-- Agregar columna de conversación a mibarber_barberos
ALTER TABLE public.mibarber_barberos
  ADD COLUMN IF NOT EXISTS id_conversacion BIGINT;

-- Comentarios para documentar
COMMENT ON COLUMN public.mibarber_sucursales.instance_name IS 'Nombre de la instancia en Evolution API';
COMMENT ON COLUMN public.mibarber_sucursales.inbox_id IS 'ID de la bandeja de entrada en Chatwoot';
COMMENT ON COLUMN public.mibarber_sucursales.id_conv_notificaciones IS 'ID de la conversación del grupo de notificaciones en Chatwoot';
COMMENT ON COLUMN public.mibarber_barberos.id_conversacion IS 'ID de la conversación del barbero en Chatwoot';
