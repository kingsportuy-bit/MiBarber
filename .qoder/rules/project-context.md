# 🧠 Contexto del Proyecto - MiBarber

## Descripción
Sistema multi-tenant de gestión integral para barberías con agenda de citas, control de caja, estadísticas y integración con WhatsApp vía N8N.

## Stack Tecnológico

### Frontend
- **Next.js 15.5.3** - App Router, SSR/CSR híbrido
- **React 19** - Componentes funcionales
- **TypeScript** - Strict mode habilitado
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Componentes accesibles
- **TanStack Query 5.59** - Server state management
- **Zustand 5.0.1** - Client state management
- **FullCalendar** - Sistema de calendario
- **Recharts** - Visualización de datos
- **Sonner** - Sistema de notificaciones

### Backend
- **Supabase** - PostgreSQL como fuente única de verdad
  - 12 tablas principales (`mibarber_*`)
  - Triggers automáticos (`update_updated_at_column()`)
  - Real-time subscriptions habilitadas
- **N8N** - Automatización WhatsApp
  - Observa cambios en DB (database-driven)
  - Escribe: `mibarber_mensajes_temporales`, `mibarber_historial`
  - Lee: `mibarber_citas`, `mibarber_clientes`, etc.

### Infrastructure
- **Docker** - Containerización
- **Traefik** - Reverse proxy
- **VPS** - Hosting dedicado

## Arquitectura Actual

### Limitaciones Identificadas
1. **Componentes monolíticos**: 
   - `AgendaBoard.tsx` (690 líneas)
   - `AppointmentModalWithSucursal.tsx` (617 líneas)
2. **Hooks sobrecargados**: 
   - `useBarberoAuth.ts` (431 líneas)
   - `useCitas.ts` (408 líneas)
   - `useEstadisticas.ts` (381 líneas)
3. **Tipado débil**: Uso frecuente de `(supabase as any)`
4. **Sin testing**: 0% de cobertura
5. **Falta de separación**: Lógica mezclada con presentación
6. **Logs excesivos**: console.log en producción

## Integración con N8N

### ⚠️ Contexto Importante (NO MODIFICAR durante refactorización)

**Arquitectura**: Database-driven + 1 webhook
- **N8N observa cambios** en tablas de Supabase (polling/triggers)
- **Web lee historial** de `mibarber_historial` (solo lectura)
- **Web envía mensajes** manuales via webhook a N8N
- **N8N escribe buffer** en `mibarber_mensajes_temporales` (no tocar)

**Flujo típico**:
Web modifica DB (citas/clientes)
→ N8N detecta cambios
→ N8N ejecuta lógica
→ N8N escribe en historial
→ Web actualiza UI (real-time)

text

**Regla crítica**: Durante refactorización, mantener intacta la lógica de queries, mutations y subscriptions.

## Multi-tenancy
- **Escala objetivo**: 100 barberías
- **Promedio**: 2 sucursales x barbería
- **Promedio**: 5 barberos x sucursal
- **Total esperado**: ~1000 barberos simultáneos
- **Aislamiento**: Por `id_barberia` en todas las tablas

## Funcionalidades Core (NO ROMPER durante refactorización)

1. **Agenda de citas** - Crítica, usa FullCalendar
2. **Autenticación custom** - Username/password con bcrypt
3. **Multi-sucursal** - Filtrado por sucursal y barbero
4. **Gestión de caja** - Ingresos/egresos vinculados a citas
5. **Estadísticas** - Dashboards con Recharts
6. **Historial WhatsApp** - Read-only desde `mibarber_historial`

## Objetivos de Profesionalización

### Durante Refactorización
1. **Componentización estricta** - Máx 200 líneas/archivo
2. **Separación lógica/presentación** - Hooks + Componentes
3. **Tipado fuerte** - 0 usos de `any`
4. **Testing** - Cobertura mínima 70%
5. **Performance** - Lazy loading, memoización
6. **Organización** - Estructura feature-based

### Después de Refactorización (Uso Continuo)
7. **SEO** - Metadata dinámica, semántica HTML
8. **Accesibilidad** - WCAG AA completo
9. **Mantenibilidad** - Código documentado y consistente
10. **Escalabilidad** - Preparado para 100+ barberías

## Filosofía de Desarrollo

- **Código limpio sobre rapidez**
- **Tipado fuerte obligatorio**
- **Testing antes de producción**
- **No romper lo que funciona**
- **Refactorizar incrementalmente**