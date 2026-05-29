# 🏗️ Arquitectura Frontend - Ecosistema BarberOX

Este documento define la estructura y las directrices arquitectónicas para el frontend de BarberOX (`MiBarber`), garantizando el estricto cumplimiento de las Leyes de BarberOX y los Contratos de Capas del ecosistema.

## 1. Cumplimiento de las Leyes de Barberox en el Frontend

### Ley 1: Ley de Responsabilidad Única
* **Regla**: El frontend presenta la UI, maneja interacciones de usuario y valida formatos de entrada. NO toma decisiones de negocio.
* **Aplicación**: 
  * Se elimina toda lógica de negocio de los componentes, hooks y contextos (ej. cálculo de comisiones de barberos, cálculo de precios finales, validación de disponibilidad de slots).
  * Los componentes se vuelven "presentacionales" o de comportamiento simple de UI.

### Ley 2: Ley de Flujo Unidireccional
* **Regla**: La UI despacha acciones -> Capa de API/Adaptadores -> Backend (Supabase/Core API) -> Base de datos. Las respuestas vuelven de forma inversa.
* **Aplicación**: 
  * Ningún componente realiza llamadas directas o consultas crudas a base de datos.
  * Todas las operaciones de lectura/escritura pasan por hooks específicos de negocio, los cuales consumen una **Capa de Adaptadores de Datos (Data Adapters)**.

### Ley 3: Ley de Contrato
* **Regla**: Los contratos de datos entre el Core backend y el Frontend son inmutables y versionados.
* **Aplicación**:
  * Definimos interfaces TypeScript estrictas en `@/types/` que corresponden exactamente a los esquemas oficiales definidos por el sistema central.
  * El frontend espera respuestas en el formato estándar BarberOX (`success`, `data`, `errors`, `meta`).

### Ley 4: Ley de Transparencia
* **Regla**: Todo error debe ser trazable e identificable mediante un identificador único (Correlation ID) y códigos de error estandarizados.
* **Aplicación**:
  * La capa de servicios del frontend inyecta un Header `X-Correlation-ID` en cada petición (cuando use API) o lo loguea localmente en peticiones a base de datos.
  * Los errores se capturan centralizadamente y se mapean a códigos estándar de Barberox (ej: `SLOT_OCCUPIED`, `INVALID_TOKEN`) para mostrar mensajes amigables al usuario final sin perder el contexto técnico para debugging.

### Ley 5: Ley de Autonomía
* **Regla**: Cada módulo del sistema funciona de forma independiente.
* **Aplicación**:
  * Las features del frontend se modularizan siguiendo el patrón de `/features/` (ej: `/features/appointments`, `/features/auth`, `/features/whatsapp`).
  * Un fallo en un módulo no bloqueante (ej: estadísticas) no interrumpe el flujo crítico de agendamiento.

### Ley 6: Ley de Seguridad
* **Regla**: Nunca confiar en datos del cliente.
* **Aplicación**:
  * El frontend no determina permisos modificando estados locales. Toda acción de edición o creación es re-validada en el backend mediante políticas de seguridad (RLS en Supabase, o middleware de autorización en el Core API).

---

## 2. Patrón de Adaptadores de Datos (Data Adapters)

Para permitir una transición transparente entre el backend temporal (Supabase directo) y la futura API del Core principal de Barberox, implementamos un **Patrón Adaptador**.

```
                           ┌──────────────────────────┐
                           │      Hooks de Datos      │
                           │  (useCitas, useBarberos) │
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │     Service Factory      │
                           │   (Decide qué usar)      │
                           └─────────────┬────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      ┌─────────────────────────┐                 ┌─────────────────────────┐
      │    Supabase Adapter     │                 │    Core API Adapter     │
      │  (Backend Actual/Temp)  │                 │  (Futuro Core/Gateway)  │
      └────────────┬────────────┘                 └────────────┬────────────┘
                   │                                           │
                   ▼                                           ▼
        [ Supabase Database ]                         [ API Gateway/Core ]
```

### Configuración de Adaptadores (`src/lib/adapters/config.ts`)
Una variable de entorno (`NEXT_PUBLIC_DATA_SOURCE`) o una configuración centralizada determina la fuente de datos por módulo:

```typescript
export type DataSource = 'supabase' | 'core_api';

export const ADAPTER_CONFIG: Record<string, DataSource> = {
  auth: 'supabase',         // Migrar a 'core_api' cuando Codex lo tenga listo
  appointments: 'supabase', // Migrar a 'core_api' cuando Codex lo tenga listo
  services: 'supabase',     // Migrar a 'core_api' cuando Codex lo tenga listo
  barbers: 'supabase',      // Migrar a 'core_api' cuando Codex lo tenga listo
  clients: 'supabase',      // Migrar a 'core_api' cuando Codex lo tenga listo
  products: 'supabase',     // Backend local vía Supabase (temporal)
  stats: 'supabase'         // Backend local vía Supabase (temporal)
};
```

---

## 3. Hoja de Ruta de Migración a APIs

1. **Fase 1: Abstracción de Repositorios**
   * Mover todas las llamadas Supabase de los hooks a clases/objetos repositorio (ej: `SupabaseAppointmentRepository`).
   * Crear las interfaces de los contratos para cada servicio.

2. **Fase 2: Implementación de Adaptador API**
   * Crear la implementación de los repositorios que consumen endpoints HTTP (`HttpAppointmentRepository`).
   * Configurar Axios/Fetch cliente con control de Correlation ID y refresh de tokens.

3. **Fase 3: Transición Dinámica**
   * Configurar los feature flags de datos en el frontend.
   * Probar el switch de origen en entorno local.
