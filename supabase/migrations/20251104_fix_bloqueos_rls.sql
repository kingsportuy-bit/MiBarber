-- Corrección de políticas RLS para mibarber_bloqueos_barbero
-- Ajustadas para manejar id_barberia en ambas rutas: raíz y app_metadata

-- Eliminar políticas existentes
DROP POLICY IF EXISTS p_bloq_select_auth ON mibarber_bloqueos_barbero;
DROP POLICY IF EXISTS p_bloq_insert_auth ON mibarber_bloqueos_barbero;
DROP POLICY IF EXISTS p_bloq_update_auth ON mibarber_bloqueos_barbero;
DROP POLICY IF EXISTS p_bloq_delete_auth ON mibarber_bloqueos_barbero;

-- Política para SELECT
CREATE POLICY p_bloq_select_auth ON mibarber_bloqueos_barbero
FOR SELECT
TO authenticated
USING (
  id_barberia = COALESCE(
    (auth.jwt() ->> 'id_barberia')::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'id_barberia')::uuid
  )
);

-- Política para INSERT
CREATE POLICY p_bloq_insert_auth ON mibarber_bloqueos_barbero
FOR INSERT
TO authenticated
WITH CHECK (
  id_barberia = COALESCE(
    (auth.jwt() ->> 'id_barberia')::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'id_barberia')::uuid
  )
);

-- Política para UPDATE
CREATE POLICY p_bloq_update_auth ON mibarber_bloqueos_barbero
FOR UPDATE
TO authenticated
USING (
  id_barberia = COALESCE(
    (auth.jwt() ->> 'id_barberia')::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'id_barberia')::uuid
  )
)
WITH CHECK (
  id_barberia = COALESCE(
    (auth.jwt() ->> 'id_barberia')::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'id_barberia')::uuid
  )
);

-- Política para DELETE
CREATE POLICY p_bloq_delete_auth ON mibarber_bloqueos_barbero
FOR DELETE
TO authenticated
USING (
  id_barberia = COALESCE(
    (auth.jwt() ->> 'id_barberia')::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'id_barberia')::uuid
  )
);

-- Asegurar que RLS está habilitada
ALTER TABLE mibarber_bloqueos_barbero ENABLE ROW LEVEL SECURITY;