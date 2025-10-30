# 🏗️ Arquitectura Objetivo - MiBarber

## Visión General
Refactorizar arquitectura frontend de monolítica a feature-based modular, manteniendo toda la lógica de base de datos existente.

## Estructura de Carpetas Objetivo

src/
├── features/ # Funcionalidades por dominio
│ ├── auth/
│ │ ├── components/ # Login, ProtectedRoute
│ │ ├── hooks/ # useAuth, useLogin, useLogout
│ │ ├── types/ # AuthState, LoginCredentials
│ │ └── index.ts # Exports públicos
│ ├── appointments/ # Sistema de citas (CORE)
│ │ ├── components/
│ │ │ ├── AgendaBoard/ # Dividir el monolito actual
│ │ │ │ ├── AgendaHeader.tsx
│ │ │ │ ├── AgendaTimeSlots.tsx
│ │ │ │ ├── AppointmentCard.tsx
│ │ │ │ └── index.tsx
│ │ │ └── AppointmentModal/
│ │ │ ├── ClientStep.tsx
│ │ │ ├── ServiceStep.tsx
│ │ │ ├── DateTimeStep.tsx
│ │ │ └── index.tsx
│ │ ├── hooks/
│ │ │ ├── useCitas.ts
│ │ │ ├── useCreateCita.ts
│ │ │ ├── useUpdateCita.ts
│ │ │ ├── useAgendaLogic.ts
│ │ │ └── useHorariosDisponibles.ts
│ │ ├── types/
│ │ └── utils/
│ ├── clients/ # Gestión de clientes
│ ├── barbershop/ # Barberos, servicios, sucursales
│ ├── cash-register/ # Caja
│ ├── dashboard/ # Estadísticas
│ └── whatsapp/ # Historial WhatsApp
├── shared/ # Código compartido
│ ├── components/ # Componentes UI reutilizables
│ │ ├── Button.tsx
│ │ ├── Modal.tsx
│ │ ├── DatePicker.tsx
│ │ └── ...
│ ├── hooks/ # Hooks genéricos
│ │ ├── useDebounce.ts
│ │ ├── useLocalStorage.ts
│ │ └── ...
│ ├── types/ # Tipos globales de Supabase
│ │ └── database.types.ts # Generado desde Supabase
│ ├── utils/ # Funciones utilitarias
│ │ ├── dateUtils.ts
│ │ ├── formatters.ts
│ │ └── validators.ts
│ ├── config/ # Configuraciones
│ └── services/ # Servicios compartidos
│ ├── SupabaseService.ts
│ └── N8NWebhookService.ts
├── app/ # Next.js App Router (mantener estructura actual)
└── lib/ # Configuración de librerías
└── supabaseClient.ts # Cliente Supabase (ya existe)

text

## Refactorización por Fases

### Fase 1: Fundaciones 
**Objetivo**: Preparar estructura sin romper nada

- [ ] Crear estructura de carpetas `/features/`, `/shared/`
- [ ] Instalar Vitest: `npm i -D vitest @vitest/ui @testing-library/react`
- [ ] Configurar `vitest.config.ts`
- [ ] Generar tipos desde Supabase: `npx supabase gen types typescript > src/shared/types/database.types.ts`
- [ ] Migrar utilidades: `utils/dateUtils.ts` → `shared/utils/dateUtils.ts`
- [ ] Validar build funciona: `npm run build`

### Fase 2: Auth 
**Objetivo**: Refactorizar `useBarberoAuth.ts` (431 líneas → ~300 líneas)

**Archivos actuales**:
- `src/hooks/useBarberoAuth.ts` (431 líneas)

**Resultado esperado**:
src/features/auth/
├── hooks/
│ ├── useAuth.ts (~100 líneas - gestión de sesión)
│ ├── useLogin.ts (~80 líneas - login/logout)
│ └── useBarberoData.ts (~70 líneas - datos del barbero)
├── services/
│ └── AuthService.ts (~100 líneas - lógica de bcrypt)
├── types/
│ └── index.ts (~50 líneas - interfaces)
└── index.ts (exports)

text

**Validación**:
- [ ] Tests: cobertura >70%
- [ ] Login funciona igual
- [ ] Permisos de admin funcionan
- [ ] Sesión persiste en localStorage

### Fase 3: Appointments 🔴 CRÍTICO
**Objetivo**: Dividir AgendaBoard (690 líneas) y AppointmentModal (617 líneas)

**Prioridad 1: AgendaBoard.tsx**
AgendaBoard (690 líneas) →
├── AgendaHeader.tsx (~60 líneas - navegación fechas, filtros)
├── AgendaTimeSlots.tsx (~120 líneas - grid de horarios)
├── AppointmentCard.tsx (~90 líneas - tarjeta individual)
├── EmptyState.tsx (~40 líneas - sin citas)
├── useAgendaLogic.ts (~180 líneas - lógica de negocio)
└── AgendaBoard/index.tsx (~80 líneas - composición)

text

**Prioridad 2: AppointmentModalWithSucursal.tsx**
AppointmentModal (617 líneas) →
├── AppointmentWizard.tsx (~100 líneas - stepper)
├── ClientStep.tsx (~120 líneas - selección cliente)
├── ServiceStep.tsx (~100 líneas - selección servicio)
├── DateTimeStep.tsx (~150 líneas - fecha/hora)
├── ConfirmationStep.tsx (~80 líneas - resumen)
└── useAppointmentForm.ts (~120 líneas - lógica formulario)

text

**Prioridad 3: useCitas.ts**
useCitas (408 líneas) →
├── useCitasList.ts (~100 líneas - query lista)
├── useCreateCita.ts (~80 líneas - mutation crear)
├── useUpdateCita.ts (~80 líneas - mutation actualizar)
├── useDeleteCita.ts (~60 líneas - mutation eliminar)
└── useCitasPorRango.ts (~80 líneas - queries rango fecha)

text

**Validación**:
- [ ] Tests E2E: crear, editar, eliminar citas
- [ ] FullCalendar sigue funcionando
- [ ] Filtros por barbero/sucursal funcionan
- [ ] Performance sin regresiones

### Fase 4: Features Secundarias (Semanas 5-6)

#### Cash Register
- Refactorizar componentes de caja
- Tests de cálculos

#### Dashboard
- Dividir `useEstadisticas.ts` (381 líneas)
- Optimizar carga de gráficos con lazy loading

#### Clientes
- Componentes de gestión de clientes
- Formularios tipados

#### WhatsApp
- Componente de historial
- Real-time subscription optimizada

### Fase 5: Performance y SEO (Semana 7)

#### Lazy Loading
// Componentes pesados
const DashboardStats = dynamic(() => import('@/features/dashboard/Stats'));
const WhatsAppHistory = dynamic(() => import('@/features/whatsapp/History'));

text

#### Metadata Dinámica
// app/agenda/page.tsx
export const metadata: Metadata = {
title: 'Agenda de Citas - MiBarber',
description: 'Gestiona las citas de tu barbería',
};

text

#### Optimizaciones
- React.memo en componentes pesados
- useMemo para cálculos complejos
- useCallback para callbacks en props

### Fase 6: Testing Completo (Semana 8)

**Cobertura objetivo: 70%**

- [ ] Tests unitarios: Hooks críticos
- [ ] Tests de componentes: Formularios
- [ ] Tests de integración: Flujos completos
- [ ] E2E con Playwright: Flujo de crear cita

## Prioridades de Migración

### 🔴 Alta Prioridad (NO ROMPER)
1. **Autenticación** - Base del sistema
2. **Agenda de citas** - Core business
3. **CRUD de citas** - Funcionalidad más usada

### 🟡 Media Prioridad
1. Gestión de caja
2. Estadísticas
3. Gestión de clientes

### 🟢 Baja Prioridad
1. Historial WhatsApp
2. Configuraciones
3. Panel de administración

## Integración con N8N (NO TOCAR)

### Contexto
La Web App se integra con N8N vía:
1. **Base de datos compartida** - N8N observa cambios
2. **Webhook único** - Para envío manual de mensajes
3. **Real-time** - Web lee `mibarber_historial`

### Durante Refactorización
- ✅ Mantener lógica de queries/mutations existente
- ✅ Preservar real-time subscriptions
- ✅ No modificar llamadas al webhook de N8N
- ❌ NO tocar schema de Supabase
- ❌ NO modificar lógica de INSERT/UPDATE

## Métricas de Éxito

| Métrica | Antes | Objetivo |
|---------|-------|----------|
| Líneas por archivo | Hasta 690 | Máx 200 |
| Líneas por hook | Hasta 431 | Máx 100 |
| Tipado `any` | Frecuente | 0 |
| Cobertura testing | 0% | 70% |
| Build time | ~X seg | <X seg |
| Lighthouse Performance | ~X | >90 |