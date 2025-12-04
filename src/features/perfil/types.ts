// Estadísticas del mes
export interface EstadisticasMes {
  turnosAtendidos: number
  turnosPendientes: number
  ingresosMes: number
  horasTrabajadas: number
}

// Servicio del barbero
export interface ServicioBarbero {
  id_servicio: string
  nombre: string
  precio: number
  duracion_minutos: number
}

// Ingreso por servicio
export interface IngresoServicio {
  servicio: string
  total_ingresos: number
  cantidad_veces: number
}

// Top cliente
export interface TopCliente {
  id_cliente: string
  nombre: string
  telefono: string
  cantidad_servicios: number
  total_gastado: number
}

// Bloqueo
export interface Bloqueo {
  id: string
  fecha: string // ISO date
  hora_inicio: string | null // HH:MM
  hora_fin: string | null // HH:MM
  tipo: 'bloqueo_dia' | 'bloqueo_horas'
  motivo: string | null
  activo: boolean
}

// Input para crear/editar bloqueo
export interface BloqueoInput {
  fecha: string
  hora_inicio?: string
  hora_fin?: string
  tipo: 'bloqueo_dia' | 'bloqueo_horas'
  motivo?: string
  activo?: boolean
}

// Descanso extra
export interface Descanso {
  id: string
  id_barberia: string
  id_sucursal: string
  id_barbero: string
  hora_inicio: string // HH:MM
  hora_fin: string // HH:MM
  dias_semana: string // "1,3,5"
  motivo: string | null
  creado_por: string
  creado_at: string // ISO date
  activo: boolean
}

// Input para crear/editar descanso
export interface DescansoInput {
  id_barberia?: string
  id_sucursal?: string
  id_barbero?: string
  hora_inicio: string
  hora_fin: string
  dias_semana: string[]
  motivo?: string
  creado_por?: string
  activo?: boolean
}