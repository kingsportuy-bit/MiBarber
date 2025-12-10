/**
 * Tipos para el módulo de Caja
 * Gestión de ingresos y gastos de la barbería
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipos de movimiento en caja
 */
export type TipoMovimiento = 'ingreso' | 'gasto_barbero' | 'gasto_barberia';

/**
 * Métodos de pago disponibles
 */
export type MetodoPago = 
  | 'efectivo' 
  | 'tarjeta' 
  | 'transferencia' 
  | 'mercadopago' 
  | 'otro';

/**
 * Tipos de factura
 */
export type TipoFactura = 'A' | 'B' | 'C' | 'E';

// ============================================
// INTERFAZ PRINCIPAL: MOVIMIENTO DE CAJA
// ============================================

/**
 * Movimiento de caja (mapeo 1:1 con tabla mibarber_caja)
 */
export interface MovimientoCaja {
  // IDs y referencias
  idRegistro: string;
  idBarberia: string;
  idSucursal: string;
  idBarbero: string; // Propietario del movimiento
  idCita?: string | null; // Si viene de cita completada
  
  // Información del movimiento
  tipo: TipoMovimiento;
  fecha: string; // formato: YYYY-MM-DD
  hora: string; // formato: HH:MM:SS
  concepto: string;
  monto: number;
  metodoPago?: string | null;
  
  // Facturación
  nroFactura?: string | null;
  tipoFactura?: TipoFactura | null;
  
  // Propinas
  propina?: number;
  
  // Metadata
  notas?: string | null;
  adjuntoUrl?: string | null; // URL de imagen/PDF
  activo: boolean; // false = eliminado lógicamente
  
  // Auditoría
  idBarberoRegistro: string; // Quién registró el movimiento
  nombreBarberoRegistro: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  
  // Relaciones (joins)
  nombreBarbero?: string; // Nombre del barbero propietario
  nombreSucursal?: string; // Nombre de la sucursal
  citaInfo?: {
    clienteNombre: string;
    servicio: string;
  } | null;
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

/**
 * Filtros para buscar movimientos de caja
 */
export interface FiltrosCaja {
  idbarberia: string; // Siempre desde sesión
  idBarbero?: string | null; // Filtrar por barbero específico
  idSucursal?: string | null; // Filtrar por sucursal (admin)
  tipo?: TipoMovimiento | null; // Filtrar por tipo de movimiento
  fechaInicio?: string | null; // formato: YYYY-MM-DD
  fechaFin?: string | null; // formato: YYYY-MM-DD
  metodoPago?: string | null; // Filtrar por método de pago
  busqueda?: string | null; // Búsqueda por concepto o nro_factura
}

// ============================================
// FORMULARIO
// ============================================

/**
 * Datos del formulario para crear/editar movimiento
 */
export interface FormularioMovimiento {
  // IDs (algunos se rellenan automáticamente)
  idSucursal: string; // Desde sesión o filtro global
  idBarbero: string; // Propietario del movimiento
  idCita?: string | null; // Opcional, si viene de cita
  
  // Datos del movimiento
  tipo: TipoMovimiento;
  fecha: string; // formato: YYYY-MM-DD
  hora: string; // formato: HH:MM
  concepto: string;
  monto: number;
  metodoPago?: string;
  
  // Facturación (opcional)
  nroFactura?: string;
  tipoFactura?: TipoFactura;
  
  // Propina (opcional)
  propina?: number;
  
  // Metadata (opcional)
  notas?: string;
  adjuntoUrl?: string;
}

// ============================================
// ESTADÍSTICAS
// ============================================

/**
 * Estadísticas calculadas de caja
 */
export interface EstadisticasCaja {
  // Totales principales
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  totalPropinas: number;
  
  // Distribución por método de pago (solo ingresos)
  metodosPago: Record<string, number>; // { "efectivo": 5000, "tarjeta": 3000 }
  
  // Análisis temporal
  ingresosPorDia: Record<string, number>; // { "lunes": 1200, "martes": 1500 }
  diaMasRentable: {
    dia: string; // "viernes"
    monto: number; // 2800
  } | null;
  
  // Comparativa
  porcentajeCambio: number; // % de cambio vs período anterior
  
  // Contadores
  totalMovimientos: number;
}

/**
 * Ranking de barberos por ingresos
 */
export interface RankingBarbero {
  idBarbero: string;
  nombreBarbero: string;
  nombreBarberoRegistro?: string; // Nombre de quien registró el movimiento
  totalIngresos: number;
  cantidadMovimientos: number;
  porcentajeDelTotal?: number; // Opcional, calculado en el frontend
}

// ============================================
// INSIGHTS Y ANÁLISIS
// ============================================

/**
 * Insights inteligentes para la caja
 */
export interface InsightsCaja {
  // Día más rentable
  diaMasRentable?: {
    dia: string;
    monto: number;
  };
  
  // Horario más rentable
  horarioMasRentable?: {
    rango: string; // "15:00 - 19:00"
    monto: number;
  };
  
  // Servicio que más factura
  servicioTop?: {
    nombre: string;
    monto: number;
    cantidad: number;
  };
  
  // Tendencia
  tendencia: 'positiva' | 'negativa' | 'estable';
  
  // Alertas
  alertas: Array<{
    tipo: 'info' | 'warning' | 'danger';
    mensaje: string;
  }>;
}

// ============================================
// METAS (OPCIONAL)
// ============================================

/**
 * Meta mensual de ingresos por barbero
 */
export interface MetaBarbero {
  idMeta: string;
  idBarbero: string;
  idBarberia: string;
  mes: number; // 1-12
  anio: number; // 2024, 2025, etc.
  montoObjetivo: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Progreso de meta
 */
export interface ProgresoMeta {
  meta: MetaBarbero;
  montoActual: number;
  porcentajeCumplimiento: number; // 0-100
  montoRestante: number;
  diasRestantes: number;
  promedioNecesarioDiario: number; // Para alcanzar la meta
}

// ============================================
// EXPORTACIÓN
// ============================================

/**
 * Configuración para exportar reportes
 */
export interface ConfigExportacion {
  formato: 'pdf' | 'excel' | 'csv';
  incluirResumen: boolean;
  incluirGraficos: boolean;
  rangoFechas: {
    inicio: string;
    fin: string;
  };
  filtros: FiltrosCaja;
}

// ============================================
// OPCIONES DE SELECT/DROPDOWN
// ============================================

/**
 * Opciones para selects del formulario
 */
export interface OpcionSelect {
  value: string;
  label: string;
}

/**
 * Opciones predefinidas
 */
export const TIPOS_MOVIMIENTO: OpcionSelect[] = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'gasto_barbero', label: 'Gasto Barbero' },
  { value: 'gasto_barberia', label: 'Gasto Barbería' },
];

export const METODOS_PAGO: OpcionSelect[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'mercadopago', label: 'Mercado Pago' },
  { value: 'otro', label: 'Otro' },
];

export const TIPOS_FACTURA: OpcionSelect[] = [
  { value: 'A', label: 'Factura A' },
  { value: 'B', label: 'Factura B' },
  { value: 'C', label: 'Factura C' },
  { value: 'E', label: 'Factura E' },
];

// ============================================
// UTILIDADES DE FORMATO
// ============================================

/**
 * Formatea un monto a moneda local
 */
export function formatearMonto(monto: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
  }).format(monto);
}

/**
 * Formatea una fecha a formato local
 */
export function formatearFecha(fecha: string): string {
  // Si ya está en formato YYYY-MM-DD, parsear manualmente para evitar problemas de zona horaria
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [year, month, day] = fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Mes es 0-indexado
    return new Intl.DateTimeFormat('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
  
  // Para otros formatos, usar el comportamiento original
  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(fecha));
}

/**
 * Formatea una hora
 */
export function formatearHora(hora: string): string {
  return hora.substring(0, 5); // HH:MM
}

/**
 * Obtiene el color según el tipo de movimiento
 */
export function getColorTipo(tipo: TipoMovimiento): string {
  switch (tipo) {
    case 'ingreso':
      return 'success'; // Verde
    case 'gasto_barbero':
      return 'warning'; // Amarillo
    case 'gasto_barberia':
      return 'danger'; // Rojo
    default:
      return 'secondary';
  }
}

/**
 * Obtiene el ícono según el tipo de movimiento
 */
export function getIconoTipo(tipo: TipoMovimiento): string {
  switch (tipo) {
    case 'ingreso':
      return '💰';
    case 'gasto_barbero':
      return '💳';
    case 'gasto_barberia':
      return '🏢';
    default:
      return '📊';
  }
}

/**
 * Valida si un movimiento puede ser editado
 */
export function puedeEditarMovimiento(
  movimiento: MovimientoCaja,
  userRole: string,
  userId: string
): boolean {
  // Admin puede editar todo
  if (userRole === 'admin') return true;
  
  // Barbero común solo puede editar sus propios movimientos
  if (movimiento.idBarberoRegistro === userId) return true;
  
  return false;
}

/**
 * Valida si un movimiento puede ser eliminado
 */
export function puedeEliminarMovimiento(
  movimiento: MovimientoCaja,
  userRole: string,
  userId: string
): boolean {
  // Mismo criterio que editar
  return puedeEditarMovimiento(movimiento, userRole, userId);
}