// Tipos sincronizados con el schema SQL de mibarber

export interface Appointment {
  id_cita: string; // UUID
  fecha: string; // Date ISO (YYYY-MM-DD)
  hora: string; // Time (HH:mm:ss)
  cliente_nombre: string;
  servicio: string;
  estado: "pendiente" | "confirmado" | "cancelado" | "completado"; // Sincronizado con SQL CHECK
  nota: string | null;
  creado: string; // timestamptz ISO
  id_cliente: string | null; // UUID
  duracion: string; // e.g., "30m", "60m"
  notificacion_barbero: string | null;
  notificacion_cliente: string | null;
  ticket: number | null; // DECIMAL en SQL
  nro_factura: string | null;
  barbero: string; // nombre del barbero (string) - TODO: debería ser id_barbero
  metodo_pago?: string | null; // Método de pago opcional
  id_barberia: string | null; // UUID
  id_sucursal: string | null; // UUID
  id_barbero?: string | null; // UUID del barbero
  id_servicio?: string | null; // UUID del servicio
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
  id_conversacion: number | null; // bigint en la BD
  puntaje: number | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null; // DATE
  id_barberia?: string | null; // UUID
  id_sucursal?: string | null; // UUID
  chat_humano?: number | null; // 0 = IA, 1 = Humano
  foto_perfil?: string | null; // URL de la foto de perfil
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface Barbero {
  id_barbero: string; // UUID
  nombre: string;
  telefono: string | null;
  email: string | null;
  especialidades: string[]; // array
  activo: boolean;
  id_barberia: string | null; // UUID
  id_sucursal: string | null; // UUID
  admin: boolean; // true = administrador, false = barbero normal
  nivel_permisos: number; // 1 = Admin, 2 = Barbero normal
  username: string | null; // Nombre de usuario para login
  password_hash: string | null; // Hash bcrypt de la contraseña
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface Service {
  id_servicio: string; // UUID
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number; // INTEGER NOT NULL DEFAULT 30
  precio: number; // DECIMAL(10,2) NOT NULL
  activo: boolean; // DEFAULT true
  id_barberia: string | null; // UUID
  id_sucursal: string | null; // UUID
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface CajaRecord {
  id_movimiento: string; // UUID
  fecha: string; // timestamptz NOT NULL DEFAULT NOW()
  tipo: "ingreso" | "egreso"; // CHECK constraint en SQL
  concepto: string; // text NOT NULL
  monto: number; // DECIMAL(10,2) NOT NULL
  id_cita: string | null; // UUID
  id_cliente: string | null; // UUID
  barbero: string | null; // text (nombre del barbero)
  metodo_pago: string; // DEFAULT 'efectivo'
  observaciones: string | null;
  id_barberia: string | null; // UUID
  id_sucursal: string | null; // UUID
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface TempMessage {
  id_mensaje_t: number; // SERIAL PRIMARY KEY
  created_at: string; // timestamptz NOT NULL DEFAULT NOW()
  id_cliente: string | null; // UUID
  mensaje: string; // text NOT NULL
  procesado: number; // DEFAULT 0
  tipo_mensaje: string; // DEFAULT 'texto'
  origen: string; // DEFAULT 'whatsapp'
  updated_at: string; // timestamptz
}

export interface Barberia {
  id: string; // UUID PRIMARY KEY
  nombre_barberia: string; // text NOT NULL
  created_at: string; // timestamptz DEFAULT NOW()
  updated_at: string; // timestamptz DEFAULT NOW()
}

export interface Sucursal {
  id: string; // UUID PRIMARY KEY
  id_barberia: string; // UUID REFERENCES mibarber_barberias
  numero_sucursal: number; // INTEGER NOT NULL
  nombre_sucursal: string | null;
  direccion: string | null;
  telefono: string | null;
  celular: string | null;
  horario: string | null; // text (horario en formato texto)
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface HorarioSucursal {
  id_horario: string; // UUID PRIMARY KEY
  id_sucursal: string; // UUID REFERENCES mibarber_sucursales
  id_dia: number; // 1-7 (Lunes-Domingo)
  nombre_dia?: string; // Opcional, para facilitar el uso
  nombre_corto?: string; // Opcional (Lun, Mar, etc.)
  hora_apertura: string; // TIME format (HH:mm:ss)
  hora_cierre: string; // TIME format (HH:mm:ss)
  hora_inicio_almuerzo: string | null; // TIME format opcional
  hora_fin_almuerzo: string | null; // TIME format opcional
  activo: boolean; // DEFAULT true
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

// Tipos auxiliares para chat (si se implementa)
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
  message: any; // Puede ser string o JSON
  timestamptz: string;
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
  tipo?: "ingreso" | "egreso";
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
  estado?: "pendiente" | "confirmado" | "cancelado" | "completado";
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
  password: string; // Se hasheará antes de guardar
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
  expiresAt: number; // timestamp en milisegundos
}