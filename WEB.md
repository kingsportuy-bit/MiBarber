# WEB.md

## Objetivo
Documentar como debe escribir la web en base de datos para que crear, modificar y cancelar turnos sigan siendo compatibles con el workflow `BARBEROX 4.0`.

Fecha de actualizacion: 2026-04-03.

## Contexto de cambios (por que hoy falla)
- El contrato de estados de `mibarber_citas.estado` es: `pendiente`, `modificado`, `cancelado`, `confirmada`, `completado`.
- `confirmado` (sin la `a`) quedo como legacy y rompe logica nueva.
- `mibarber_clientes.notificacion_turno` ya no existe como columna de cliente.
- El bot depende de `mibarber_clientes.fase`, `fase_updated_at`, `contexto_turno_id`, `booking_data`, `session_ctx`, `stats`.
- Si la web solo toca `mibarber_citas` y no sincroniza `mibarber_clientes`, las siguientes acciones conversacionales pueden fallar o quedar desalineadas.

## Regla de stats para acciones manuales web
- Esta regla es obligatoria para web manual.
- `cancelar` manual: `stats.turnos_cancelados += 1`.
- `modificar` manual: `stats.turnos_reagendados += 1`.
- `crear` manual: no sumar `turnos_reagendados` por defecto.
- Si en web se cancela y luego se crea el mismo dia, tratarlo como dos acciones separadas (sin compensacion automatica de cancelado).

## Fases obligatorias (cliente + cita)
- Esto es obligatorio en cada accion.
- Fase de cliente: `mibarber_clientes.fase`.
- Fase de cita (lo que en web suelen llamar `fase_turno`): en DB se refleja con `mibarber_citas.estado` y `mibarber_citas.estado_ciclo`.
- Si la web usa un campo interno llamado `fase_turno`, debe mapearse correctamente a esos 2 campos reales de DB.

## Regla bloqueante de estado en citas
- La web (frontend + backend) debe contemplar siempre `completado` dentro de `mibarber_citas.estado`.
- Conjunto valido obligatorio: `pendiente`, `modificado`, `cancelado`, `confirmada`, `completado`.
- No filtrar ni descartar `completado` en listados, reportes o validaciones internas.

## Contrato de escritura por accion

### 1) Crear turno desde web
- Insertar en `mibarber_citas` con al menos:
- `fecha`, `hora`, `cliente_nombre`, `servicio`, `id_cliente`, `id_barberia`, `id_sucursal`, `id_barbero`, `id_servicio`, `ticket`, `id_conv`.
- `estado='pendiente'`.
- `estado_ciclo='pendiente'`.
- `notificacion_barbero='no'` para disparar notificacion operativa.
- En `mibarber_clientes` actualizar:
- `fase='2'`, `fase_anterior=NULL`, `fase_updated_at=NOW()`.
- `contexto_turno_id=<id_cita_creada>`.
- `booking_data='{}'`.
- `estado_turno=NULL` o equivalente limpio.
- `session_ctx='{}'` o limpiar al menos `cancelacionReciente/reagendado`.

### 2) Modificar turno desde web
- Actualizar `mibarber_citas` por `id_cita`:
- `fecha`, `hora`, `duracion`, `nota` (si aplica).
- `estado='modificado'`.
- `estado_ciclo='pendiente'` (reset de ciclo operativo al reagendar).
- `notificacion_barbero='no'`.
- Mantener IDs (`id_cliente`, `id_barbero`, `id_servicio`, `id_sucursal`) consistentes.
- En `mibarber_clientes` actualizar:
- `fase='2'`, `fase_anterior=NULL`, `fase_updated_at=NOW()`.
- `contexto_turno_id=<id_cita_modificada>`.
- `booking_data='{}'`.
- `stats.turnos_reagendados += 1`.
- Regla importante: `modificado` es un estado transitorio de pocos segundos.
- Flujo esperado: trigger de Supabase -> webhook n8n de notificacion al barbero -> cambio final de estado a `pendiente`.
- Si la web saltea esa ruta, debe dejar el estado final en `pendiente` para que el bot vea el turno como activo.
- Fase cliente esperada luego de reagendar: `fase='2'`.

### 3) Cancelar turno desde web
- Actualizar `mibarber_citas` por `id_cita`:
- `estado='cancelado'`.
- `estado_ciclo='cancelado'` (si usan ciclo explicitamente en web/back).
- `notificacion_barbero='no'`.
- En `mibarber_clientes`:
- `stats.turnos_cancelados += 1`.
- Si el cliente no tiene mas turnos activos (`pendiente` o `confirmada`): `fase='6'` si `total_visitas>0`, si no `fase='1'`.
- Si todavia tiene otro turno activo: mantener `fase='2'` y apuntar `contexto_turno_id` al turno vigente.
- Siempre actualizar `fase_updated_at=NOW()`.
- Limpiar `booking_data` y `estado_turno`.
- Limpiar `session_ctx.cancelacionReciente` para no contaminar logica conversacional futura.

## Recomendacion tecnica (transaccion)
- Ejecutar cada accion web en una transaccion unica que incluya:
- Escritura de `mibarber_citas`.
- Escritura de `mibarber_clientes` (`fase/contexto/stats`).
- Commit/rollback atomico.
- Evita estados mixtos tipo: cita cancelada pero cliente en fase 2 con contexto viejo.

## Cosas extra que pueden fallar (verificadas)
- Usar `estado='confirmado'` en lugar de `confirmada`.
- No setear `notificacion_barbero='no'` en crear/modificar/cancelar y perder notificaciones.
- Dejar una cita en `modificado` sin normalizarla a `pendiente`: el bot puede no encontrar turno activo.
- No actualizar `contexto_turno_id`: falla confirmacion por ACK (`CONFIRMAR_CITA` usa ese id como fallback).
- No actualizar `fase_updated_at`: TTL de fase puede resetear flujo inesperadamente.
- No limpiar `session_ctx` tras operacion manual: mezcla estado manual con contexto conversacional anterior.
- Colision por indice unico `uq_citas_activa_fecha_hora_barbero` al crear/modificar en slot ocupado.

## Inconsistencia detectada para revisar
- Hay una query de recurrentes (`GET_CLIENTES_INACTIVOS`) que usa `estado IN ('pendiente','confirmado')`.
- Deberia usar `confirmada` para no tratar turnos confirmados como inexistentes.

## Checklist rapido para dev web
- Crear/modificar/cancelar actualiza `mibarber_citas` y `mibarber_clientes` en la misma transaccion.
- `stats` se mueve por accion manual real, sin compensacion automatica cancelar->crear mismo dia.
- `contexto_turno_id`, `fase`, `fase_updated_at` quedan consistentes.
- `modificado` queda solo transitorio y el estado final vuelve a `pendiente`.
- No se usa `confirmado` (solo `confirmada`).
