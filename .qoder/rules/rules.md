⚙️ Qoder Rules – Barberox
Fuentes de verdad
Respetar este archivo y .qoder/project-context.md antes de proponer cambios.

Usar documentación oficial (Next.js, TanStack Query, Supabase, dnd-kit) ante dudas.

Si una decisión afecta arquitectura o seguridad, pedir confirmación del Tech Lead.

Tipado y estilo
TypeScript estricto: sin any ni unknown; preferir tipos derivados y utilidades de types/.

Validar entrada/salida con Zod en fronteras (formularios, API).

Tailwind para estilos; evitar inline styles salvo excepciones justificadas.

App Router y componentes
Páginas y layouts en src/app; componentes de UI en src/components.

Colocar "use client" solo donde sea necesario (formularios, dnd, toasts).

Separar lógica pesada en hooks (src/hooks) y mantener render declarativo.

React Query
Usar keys canon:

Citas: ["citas", fecha, sucursalId, barberoId]

Sucursales: ["sucursales", idBarberia]

Barberos: ["barberos", idBarberia, sucursalId]

En mutaciones, realizar optimistic update y luego invalidateQueries sólo si ocurre error o si hay desincronización evidente.

No compartir estados remotos en múltiples fuentes; React Query es la fuente de verdad del servidor.

Seguridad de datos (OBLIGATORIO)
Todas las consultas y mutaciones deben incluir id_barberia proveniente de sesión, nunca de UI.

Para usuarios no admin: bloquear cambios de sucursal en UI y en server (doble validación).

Validar estado de citas contra el set permitido por DB: "pendiente" | "confirmado" | "completado" | "cancelado".

Filtros globales
Un único origen de filtros (GlobalFilters + Context) consumido por Dashboard, Agenda, WhatsApp, Estadísticas.

Prioridad: id_barberia (sesión) → sucursal (admin editable / barbero fija) → barbero opcional → fecha.

Prohibido duplicar lógica de filtros por página; factorizar si se detecta.

dnd-kit (Kanban)
Sensores: Pointer/Mouse/Touch con activationConstraint y Keyboard con sortableKeyboardCoordinates.

collisionDetection=closestCorners.

Columnas droppables con id igual al estado lógico ("pendiente" etc.); si se suelta sobre tarjeta, resolver columna por pertenencia.

En onDragEnd, mapear contenedor → estado válido y actualizar con optimistic update; revertir ante error.

Supabase
Usar getSupabaseClient() centralizado; nunca crear clientes ad-hoc.

Toda mutación de cita debe incluir validación local y manejar errores detallados (code, message, details).

Alinear el modelo de estados de UI con el constraint mibarber_citas_estado_check.

Calidad
ESLint y build sin errores.

Tests en componentes críticos (Kanban drag-end, filtros globales, hooks de datos).

Documentar props y responsabilidades con JSDoc cuando corresponda.

Entregas y PRs automatizables por qoder
Si se detecta duplicación de filtros o lógica de estados, proponer refactor a shared/ (componentes) y hooks/ (lógica).

Al agregar features: definir keys, invalidaciones, tipos en types/ y, si aplica, esquemas Zod.

No introducir dependencias sin aprobación previa.