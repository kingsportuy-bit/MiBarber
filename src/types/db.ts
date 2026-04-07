// Tipos sincronizados con el schema SQL de mibarber
// Última sincronización: 2026-04-03 con schema.sql

// Estados válidos para citas (sincronizado con chk_estado_cita)
export type EstadoCita = "pendiente" | "modificado" | "cancelado" | "confirmada" | "completado";

// Fases válidas para clientes (sincronizado con chk_fase)
export type FaseCliente = "1" | "2" | "3" | "4" | "R" | "5" | "6";

// Stats del cliente (sincronizado con default de stats jsonb)
export interface ClientStats {
  reactivaciones: number;
  turnos_cancelados: number;
  turnos_completados: number;
  turnos_reagendados: number;
}

export interface Appointment {
  id_cita: string; // UUID
  fecha: string; // Date ISO (YYYY-MM-DD)
  hora: string; // Time (HH:mm:ss)
  cliente_nombre: string;
  servicio: string;
  estado: EstadoCita;
  nota: string | null;
  id_cliente: string | null; // UUID
  duracion: string; // e.g., "30m", "60m"
  notificacion_barbero: string | null; // 'si' | 'no'
  notificacion_recordatorio: string | null; // 'si' | 'no'
  notificacion_confirmacion: string; // 'si' | 'no' (NOT NULL DEFAULT 'no')
  ticket: number | null; // DECIMAL en SQL
  nro_factura: string | null;
  barbero: string; // nombre del barbero (string) - DEPRECATED: usar id_barbero en su lugar
  metodo_pago?: string | null;
  id_barberia: string | null; // UUID
  id_sucursal: string | null; // UUID
  id_barbero?: string | null; // UUID del barbero
  id_servicio?: string | null; // UUID del servicio
  telefono?: string | null;
  id_conv?: number | null; // smallint en la BD
  estado_ciclo?: string | null; // 'pendiente' | 'cancelado' etc.
  origen_fase?: string | null;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
}

export interface Client {
  id_cliente: string; // UUID
  fecha_creacion: string; // timestamptz
  nombre: string;
  nivel_cliente: number | null;
  notas: string | null;
  ultima_interaccion: string | null; // timestamptz
  id_conversacion: number | null; // integer en la BD
  puntaje: number | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null; // DATE
  id_barberia?: string | null; // UUID
  id_sucursal?: string | null; // UUID
  chat_humano?: number | null; // 0 = IA, 1 = Humano
  foto_perfil?: string | null;
  mensaje_inicial?: string | null; // DEFAULT '1'
  estado_turno?: any | null; // jsonb
  buffer_session?: string | null;
  buffer_session_id?: string | null; // UUID
  session_ctx?: any | null; // jsonb DEFAULT '{}'
  ultima_notificacion_recurrencia?: string | null; // timestamptz
  notificado_recurrencia?: boolean; // DEFAULT false
  fase?: FaseCliente; // DEFAULT '1'
  fase_anterior?: string | null;
  fase_updated_at?: string; // timestamptz DEFAULT now()
  ultima_fase?: string | null;
  ultima_visita?: string | null; // date
  total_visitas?: number; // DEFAULT 0
  servicio_habitual?: string | null;
  barbero_habitual?: string | null; // UUID
  booking_data?: any; // jsonb DEFAULT '{}'
  stats?: ClientStats; // jsonb con defaults
  contexto_turno_id?: string | null; // UUID
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface Barbero {
  id_barbero: string; // UUID
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  especialidades?: string[]; // array
  activo?: boolean;
  id_barberia: string | null; // UUID
  id_sucursal: string | null; // UUID
  admin?: boolean;
  nivel_permisos?: number;
  username?: string | null;
  password_hash?: string | null;
  conf_inicial?: string | null;
  id_conv_barbero?: number | null;
  grupo_notificaciones?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id_servicio: string; // UUID
  nombre: string;
  descripcion?: string | null;
  duracion_minutos: number;
  precio: number;
  activo?: boolean;
  id_barberia: string | null; // UUID
  id_sucursal: string | null; // UUID
  created_at: string;
  updated_at: string;
}

export interface CajaRecord {
  id_registro: string; // UUID (PK real en schema)
  id_barberia: string;
  id_sucursal: string;
  id_barbero: string;
  id_cita: string | null;
  tipo: "ingreso" | "gasto_barbero" | "gasto_barberia";
  fecha: string; // date
  hora: string; // time
  concepto: string;
  monto: number; // DECIMAL(10,2)
  metodo_pago: string | null;
  nro_factura: string | null;
  tipo_factura: string | null;
  propina: number | null;
  notas: string | null;
  adjunto_url: string | null;
  activo: boolean;
  id_barbero_registro: string;
  nombre_barbero_registro: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Aliases para compatibilidad con código existente
  id_movimiento?: string;
  id_cliente?: string | null;
  barbero?: string | null;
  observaciones?: string | null;
}

export interface TempMessage {
  id: string; // UUID (PK real en schema)
  created_at: string;
  conversationid: string | null;
  mensaje: string | null;
  procesado: number;
}

export interface Barberia {
  id: string; // UUID PRIMARY KEY
  nombre_barberia: string;
  pais?: string | null;
  ciudad?: string | null;
  cod_pais?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sucursal {
  id: string; // UUID PRIMARY KEY
  id_barberia: string;
  numero_sucursal: number;
  nombre_sucursal: string | null;
  direccion?: string | null;
  telefono?: string | null;
  info?: string | null;
  inbox?: number | null;
  grupo_not_desactivar?: number | null;
  wpp_activo?: string | null;
  qr?: string | null;
  AVISO_BARBERO_ADMIN?: string | null;
  personalidad?: string | null;
  id_system?: string | null;
  conf_incial?: string | null;
  tokens_diarios?: number | null;
  tokens_historico?: number | null;
  activa?: boolean;
  config?: any; // jsonb
  created_at: string;
  updated_at: string;
}

export interface HorarioSucursal {
  id_horario: string;
  id_sucursal: string;
  id_dia: number; // 0-6 (Domingo-Sábado)
  nombre_dia?: string;
  nombre_corto?: string;
  hora_apertura: string;
  hora_cierre: string;
  hora_inicio_almuerzo: string | null;
  hora_fin_almuerzo: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos auxiliares para chat
export interface ChatMessage {
  timestamp: string;
  sender: "client" | "agent";
  content: string;
  type?: string;
  [key: string]: any;
}

export interface ChatConversation {
  session_id: string;
  messages: ChatMessage[];
  lastActivity: string;
}

// Tipo para registros de historial de chat
export interface HistoryLog {
  id: number;
  session_id: string;
  message: any;
  timestamptz: string;
  id_sucursal?: string | null;
}

// Tipos para estadísticas y dashboard
export interface DashboardStats {
  citasHoy: number;
  ingresosHoy: number;
  clientesNuevos: number;
  citasPendientes: number;
}

export interface BarberoStats {
  id_barbero: string;
  nombre: string;
  citas_completadas: number;
  ingresos_generados: number;
  promedio_ticket: number;
}

// Tipos para filtros
export interface DateRangeFilter {
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
}

export interface CajaFilters extends Partial<DateRangeFilter> {
  barbero?: string;
  sucursalId?: string;
  metodoPago?: string;
  tipo?: "ingreso" | "gasto_barbero" | "gasto_barberia";
}

// Tipo para respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tipos para formularios
export interface CreateAppointmentInput {
  fecha: string;
  hora: string;
  cliente_nombre: string;
  servicio: string;
  id_servicio?: string;
  barbero: string;
  id_barbero?: string;
  id_sucursal: string;
  id_barberia: string;
  duracion?: string;
  nota?: string;
}

export interface UpdateAppointmentInput
  extends Partial<CreateAppointmentInput> {
  id_cita: string;
  estado?: EstadoCita;
  ticket?: number;
  nro_factura?: string;
  metodo_pago?: string;
}

export interface CreateBarberoInput {
  nombre: string;
  telefono?: string;
  email?: string;
  especialidades?: string[];
  id_barberia: string;
  id_sucursal?: string;
  username: string;
  password: string;
  admin?: boolean;
  nivel_permisos?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    nivel_permisos: number;
    admin: boolean;
    id_barberia: string | null;
    id_sucursal: string | null;
  };
  expiresAt: number;
}