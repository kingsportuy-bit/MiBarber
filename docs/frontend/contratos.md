# 📋 Contratos de Datos e Integración del Frontend

Este documento detalla la estructura contractual de datos utilizada en el frontend de `MiBarber` para comunicarse con sus orígenes de datos (Supabase actual y Core API futura).

---

## 1. Contrato de Citas / Turnos (`Appointment`)

* **Ubicación en Código**: `@/types/db.ts`
* **Esquema de Base de Datos**: `mibarber_citas`
* **Esquema de API Esperado**: Conforme al schema `schemas/appointment.schema.json` del sistema central.

### Estructura del Objeto
```typescript
export interface Appointment {
  id: string;              // UUID único del turno
  id_barberia: string;     // UUID de la barbería
  id_sucursal: string;     // UUID de la sucursal
  id_barbero: string;      // UUID del barbero asignado
  id_cliente: string;      // UUID del cliente
  fecha: string;           // Formato YYYY-MM-DD
  hora: string;            // Formato HH:mm
  duracion: number;        // Duración en minutos (calculado por backend/core)
  precio: number;          // Precio cobrado (calculado por backend/core)
  estado: AppointmentStatus; // 'confirmado' | 'pendiente' | 'cancelado' | 'no_asistio'
  notas?: string;          // Notas adicionales
  nombre_cliente?: string; // Cacheado para presentación rápida
  telefono_cliente?: string; // Cacheado para envío de mensajes
  created_at?: string;     // Timestamp de creación
  updated_at?: string;     // Timestamp de última actualización
}

export type AppointmentStatus = 'confirmado' | 'pendiente' | 'cancelado' | 'no_asistio';
```

---

## 2. Contrato de Barberos / Empleados (`Barbero`)

* **Ubicación en Código**: `@/types/db.ts`
* **Esquema de Base de Datos**: `mibarber_barberos`

### Estructura del Objeto
```typescript
export interface Barbero {
  id_barbero: string;      // UUID único del barbero
  id_barberia: string;     // UUID de la barbería
  nombre: string;          // Nombre para presentación
  email?: string;          // Email de contacto
  telefono?: string;       // Teléfono de contacto
  avatar_url?: string;     // URL de foto
  activo: boolean;         // Estado laboral
  rol: 'admin' | 'barbero'; // Rol de permisos
  comision?: number;       // Comisión asignada (lógica procesada en backend)
}
```

---

## 3. Estado de Integración de Módulos (Tabla de Control)

El frontend mantiene un control estricto de qué adaptadores están consumiendo Supabase y cuáles están listos para migrar a la API del Core central:

| Módulo | Tipo de Datos | Estado Actual | Adaptador de Transición | URL de API Gateway del Core |
| :--- | :--- | :--- | :--- | :--- |
| **Autenticación** | `Auth / Sesión` | `Supabase Auth` | `SupabaseAuthAdapter` | `/api/v1/auth/*` (Preparado) |
| **Citas** | `Appointment` | `Supabase DB` | `SupabaseAppointmentAdapter` | `/api/v1/appointments/*` (Preparado) |
| **Servicios** | `Service` | `Supabase DB` | `SupabaseServiceAdapter` | `/api/v1/services/*` (Preparado) |
| **Barberos** | `Barber` | `Supabase DB` | `SupabaseBarberAdapter` | `/api/v1/barbers/*` (Preparado) |
| **Clientes** | `Client` | `Supabase DB` | `SupabaseClientAdapter` | `/api/v1/clients/*` (Preparado) |
| **Productos** | `Product` | `Supabase DB` | `SupabaseProductAdapter` | En desarrollo en Core (Local Temporal) |
| **Estadísticas** | `Stats` | `Supabase DB` | `SupabaseStatsAdapter` | En desarrollo en Core (Local Temporal) |

---

## 4. Estándar de Comunicación del Cliente HTTP

Cuando se active el adaptador `core_api`, toda la comunicación HTTP debe realizarse utilizando un cliente común configurado con las siguientes directrices:

1. **Autenticación Bearer**: Inyección automática del header `Authorization: Bearer <token>`.
2. **Correlation ID**: Generación automática de un Correlation ID por cada flujo para trazabilidad (Ley de Transparencia):
   ```typescript
   headers['X-Correlation-ID'] = `FE-${uuid()}`;
   ```
3. **Mapeo de Errores Estándar**:
   Si la API retorna un error:
   ```json
   {
     "success": false,
     "message": "El turno seleccionado ya está ocupado",
     "errors": [
       {
         "field": "hora",
         "code": "SLOT_OCCUPIED",
         "message": "El slot a las 15:30 con el barbero X ya no está disponible"
       }
     ]
   }
   ```
   El cliente HTTP del frontend transformará esto en un objeto de error estándar que los hooks de React Query capturan y exponen directamente en el atributo `error` para que la UI lo dibuje de forma amigable usando Toasts o banners de error.
