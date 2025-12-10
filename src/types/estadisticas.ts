// Tipos para estadísticas de la aplicación

export interface FiltrosEstadisticas {
  sucursalId?: string | null;
  barberoId?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

// Estadísticas de Sucursales
export interface EstadisticaSucursal {
  id_sucursal: string;
  nombre_sucursal: string;
  total_citas: number;
  ingresos_totales: number;
  ingresos_promedio: number;
  tasa_ocupacion: number;
  ranking: number;
}

// Estadísticas de Caja
export interface EstadisticaCaja {
  id_barbero: string;
  nombre_barbero: string;
  ingresos_totales: number;
  metodo_pago: string;
  ingresos_mes_actual: number;
  ingresos_mes_anterior: number;
  ticket_promedio: number;
}

// Estadísticas de Barberos
export interface EstadisticaBarbero {
  id_barbero: string;
  nombre_barbero: string;
  total_citas_completadas: number;
  ingresos_generados: number;
  promedio_valoracion: number;
  tasa_cancelacion: number;
  horarios_productivos: string[];
}

// Estadísticas de Servicios
export interface EstadisticaServicio {
  id_servicio: string;
  nombre_servicio: string;
  total_solicitudes: number;
  ingresos_totales: number;
  duracion_promedio: number;
  tasa_cancelacion: number;
}

// Estadísticas de Clientes
export interface EstadisticaCliente {
  total_clientes_unicos: number;
  clientes_nuevos: number;
  clientes_recurrentes: number;
  tasa_retencion: number;
  clientes_frecuentes: Array<{
    id_cliente: string;
    nombre_cliente: string;
    total_visitas: number;
  }>;
  promedio_visitas_por_cliente: number;
}

// Estadísticas de Bot IA
export interface EstadisticaBotIA {
  total_interacciones: number;
  citas_agendadas_bot: number;
  citas_agendadas_manual: number;
  tasa_conversion: number;
  consultas_frecuentes: string[];
  horarios_uso_bot: string[];
}

// Tipo para estadísticas de administrador
export interface AdminEstadisticas {
  ingresosPorSucursal: Record<string, number>;
  ingresosPorBarbero: Record<string, number>;
  ingresosPorServicio: Record<string, number>;
  turnosPorHora: Record<string, number>;
  productividadBarbero: Record<string, number>;
  serviciosRentables: Record<string, number>;
  distribucionClientes: Record<string, number>;
  ingresosTendencia: Record<string, number>;
}