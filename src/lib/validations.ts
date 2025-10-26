import { z } from 'zod';

/**
 * Schemas de validación con Zod para formularios
 * Estos schemas validan los datos antes de enviarlos a la base de datos
 */

// =============================================
// VALIDACIONES COMUNES
// =============================================

const uuidSchema = z.string().uuid('ID inválido');
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD');
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora debe estar en formato HH:mm o HH:mm:ss');
const phoneSchema = z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Teléfono inválido').min(7, 'Teléfono muy corto').max(20, 'Teléfono muy largo').optional();
const emailSchema = z.string().email('Email inválido').optional();

// =============================================
// VALIDACIONES DE AUTENTICACIÓN
// =============================================

export const loginSchema = z.object({
  username: z.string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50, 'El usuario es muy largo'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es muy larga'),
});

export const createBarberoSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
  telefono: phoneSchema,
  email: emailSchema,
  especialidades: z.array(z.string()).optional().default([]),
  id_barberia: uuidSchema,
  id_sucursal: uuidSchema.optional(),
  username: z.string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50, 'El usuario es muy largo')
    .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guión bajo'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es muy larga')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  admin: z.boolean().optional().default(false),
  nivel_permisos: z.number().int().min(1).max(3).optional().default(2),
});

export const updateBarberoSchema = createBarberoSchema.partial().extend({
  id_barbero: uuidSchema,
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es muy larga')
    .optional(),
});

// =============================================
// VALIDACIONES DE CITAS
// =============================================

export const createAppointmentSchema = z.object({
  fecha: dateSchema,
  hora: timeSchema,
  cliente_nombre: z.string()
    .min(2, 'El nombre del cliente debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
  servicio: z.string()
    .min(1, 'Debe seleccionar un servicio'),
  id_servicio: uuidSchema.optional(),
  barbero: z.string()
    .min(1, 'Debe seleccionar un barbero'),
  id_barbero: uuidSchema.optional(),
  id_sucursal: uuidSchema,
  id_barberia: uuidSchema,
  duracion: z.string()
    .regex(/^\d+m$/, 'Duración debe estar en formato "30m", "60m", etc.')
    .optional()
    .default('30m'),
  nota: z.string().max(500, 'La nota es muy larga').optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  id_cita: uuidSchema,
  estado: z.enum(['pendiente', 'confirmado', 'cancelado', 'completado']).optional(),
  ticket: z.number().min(0, 'El ticket no puede ser negativo').optional(),
  nro_factura: z.string().max(50, 'Número de factura muy largo').optional(),
  metodo_pago: z.string().max(50).optional(),
});

export const completeAppointmentSchema = z.object({
  id_cita: uuidSchema,
  estado: z.literal('completado'),
  ticket: z.number().min(0, 'El ticket debe ser un valor positivo'),
  metodo_pago: z.string().min(1, 'Debe seleccionar un método de pago'),
  nro_factura: z.string().max(50, 'Número de factura muy largo').optional(),
});

// =============================================
// VALIDACIONES DE CLIENTES
// =============================================

export const createClientSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
  telefono: phoneSchema,
  email: emailSchema,
  direccion: z.string().max(200, 'La dirección es muy larga').optional(),
  fecha_nacimiento: dateSchema.optional(),
  notas: z.string().max(1000, 'Las notas son muy largas').optional(),
  id_barberia: uuidSchema.optional(),
  id_sucursal: uuidSchema.optional(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  id_cliente: uuidSchema,
});

// =============================================
// VALIDACIONES DE SERVICIOS
// =============================================

export const createServiceSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
  descripcion: z.string().max(500, 'La descripción es muy larga').optional(),
  duracion_minutos: z.number()
    .int('La duración debe ser un número entero')
    .min(5, 'La duración mínima es 5 minutos')
    .max(480, 'La duración máxima es 480 minutos (8 horas)'),
  precio: z.number()
    .min(0, 'El precio no puede ser negativo')
    .max(9999999.99, 'El precio es muy alto'),
  activo: z.boolean().optional().default(true),
  id_barberia: uuidSchema.optional(),
  id_sucursal: uuidSchema.optional(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  id_servicio: uuidSchema,
});

// =============================================
// VALIDACIONES DE CAJA
// =============================================

export const createCajaRecordSchema = z.object({
  fecha: z.string().optional(), // Se usará NOW() si no se proporciona
  tipo: z.enum(['ingreso', 'egreso']),
  concepto: z.string()
    .min(3, 'El concepto debe tener al menos 3 caracteres')
    .max(200, 'El concepto es muy largo'),
  monto: z.number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(9999999.99, 'El monto es muy alto'),
  id_cita: uuidSchema.optional(),
  id_cliente: uuidSchema.optional(),
  barbero: z.string().max(100).optional(),
  metodo_pago: z.string()
    .max(50, 'Método de pago muy largo')
    .optional()
    .default('efectivo'),
  observaciones: z.string().max(500, 'Las observaciones son muy largas').optional(),
  id_barberia: uuidSchema.optional(),
  id_sucursal: uuidSchema.optional(),
});

export const updateCajaRecordSchema = createCajaRecordSchema.partial().extend({
  id_movimiento: uuidSchema,
});

// =============================================
// VALIDACIONES DE BARBERÍAS Y SUCURSALES
// =============================================

export const createBarberiaSchema = z.object({
  nombre_barberia: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo'),
});

export const createSucursalSchema = z.object({
  id_barberia: uuidSchema,
  numero_sucursal: z.number().int().min(1, 'El número de sucursal debe ser mayor a 0'),
  nombre_sucursal: z.string().max(100).optional(),
  direccion: z.string().max(200).optional(),
  telefono: phoneSchema,
  celular: phoneSchema,
  horario: z.string().max(500).optional(),
});

export const updateSucursalSchema = createSucursalSchema.partial().extend({
  id: uuidSchema,
});

// =============================================
// VALIDACIONES DE FILTROS
// =============================================

export const dateRangeFilterSchema = z.object({
  desde: dateSchema.optional(),
  hasta: dateSchema.optional(),
}).refine(
  (data) => {
    if (data.desde && data.hasta) {
      return new Date(data.desde) <= new Date(data.hasta);
    }
    return true;
  },
  {
    message: 'La fecha "desde" debe ser anterior a la fecha "hasta"',
    path: ['desde'],
  }
);

export const cajaFiltersSchema = dateRangeFilterSchema.and(z.object({
  barbero: z.string().optional(),
  sucursalId: uuidSchema.optional(),
  metodoPago: z.string().optional(),
  tipo: z.enum(['ingreso', 'egreso']).optional(),
}));

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// =============================================
// TIPOS INFERIDOS (para usar en TypeScript)
// =============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBarberoInput = z.infer<typeof createBarberoSchema>;
export type UpdateBarberoInput = z.infer<typeof updateBarberoSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CompleteAppointmentInput = z.infer<typeof completeAppointmentSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateCajaRecordInput = z.infer<typeof createCajaRecordSchema>;
export type UpdateCajaRecordInput = z.infer<typeof updateCajaRecordSchema>;
export type CreateBarberiaInput = z.infer<typeof createBarberiaSchema>;
export type CreateSucursalInput = z.infer<typeof createSucursalSchema>;
export type UpdateSucursalInput = z.infer<typeof updateSucursalSchema>;
export type DateRangeFilter = z.infer<typeof dateRangeFilterSchema>;
export type CajaFilters = z.infer<typeof cajaFiltersSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
