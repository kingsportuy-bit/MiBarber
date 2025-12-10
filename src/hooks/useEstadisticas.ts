// Hooks reutilizables para estadísticas
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type {
  FiltrosEstadisticas,
  EstadisticaSucursal,
  EstadisticaCaja,
  EstadisticaBarbero,
  EstadisticaServicio,
  EstadisticaCliente,
  EstadisticaBotIA,
  AdminEstadisticas
} from '@/types/estadisticas';

// Reexportar el tipo AdminEstadisticas para que esté disponible en este módulo
export type { AdminEstadisticas };

// Tipo para las estadísticas de barbero
interface BarberoEstadisticas {
  ingresosGenerados: number;
  turnosCompletados: number;
  ticketPromedio: number;
  tasaUtilizacion: number;
  tasaRetencion: number;
  serviciosPopulares: Record<string, number>;
  horariosPico: Record<string, number>;
  ingresosTendencia: Record<string, number>;
}

interface FiltrosBarberoEstadisticas {
  periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
  barberoId: string;
  sucursalId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Función para obtener estadísticas de barbero
async function fetchEstadisticasBarbero(
  filtros: FiltrosBarberoEstadisticas
): Promise<BarberoEstadisticas> {
  const { periodo, barberoId } = filtros;

  // Obtener rango de fechas según el período
  const hoy = new Date();
  let fechaInicio: Date;
  
  switch (periodo) {
    case 'diario':
      fechaInicio = new Date(hoy);
      fechaInicio.setDate(hoy.getDate() - 1);
      break;
    case 'semanal':
      fechaInicio = new Date(hoy);
      fechaInicio.setDate(hoy.getDate() - 7);
      break;
    case 'mensual':
      fechaInicio = new Date(hoy);
      fechaInicio.setMonth(hoy.getMonth() - 1);
      break;
    case 'trimestral':
      fechaInicio = new Date(hoy);
      fechaInicio.setMonth(hoy.getMonth() - 3);
      break;
    case 'anual':
      fechaInicio = new Date(hoy);
      fechaInicio.setFullYear(hoy.getFullYear() - 1);
      break;
    default:
      fechaInicio = new Date(hoy);
      fechaInicio.setMonth(hoy.getMonth() - 1);
  }

  // Query para obtener citas del barbero en el período
  const { data: citas, error } = await supabase
    .from('mibarber_citas')
    .select('*')
    .eq('id_barbero', barberoId)
    .gte('fecha', fechaInicio.toISOString().split('T')[0])
    .lte('fecha', hoy.toISOString().split('T')[0]);

  if (error) throw error;

  // Filtrar solo citas completadas
  const citasCompletadas = citas?.filter(cita => cita.estado === 'completado') || [];

  // Calcular ingresos generados
  const ingresosGenerados = citasCompletadas.reduce((sum, cita) => {
    return sum + (parseFloat(cita.ticket) || 0);
  }, 0);

  // Turnos completados
  const turnosCompletados = citasCompletadas.length;

  // Ticket promedio
  const ticketPromedio = turnosCompletados > 0 ? ingresosGenerados / turnosCompletados : 0;

  // Tasa de utilización (simulada)
  const tasaUtilizacion = Math.min(100, Math.round((turnosCompletados / 20) * 100));

  // Servicios populares
  const serviciosPopulares: Record<string, number> = {};
  citasCompletadas.forEach(cita => {
    const servicio = cita.servicio || 'Sin servicio';
    serviciosPopulares[servicio] = (serviciosPopulares[servicio] || 0) + 1;
  });

  // Tasa de retención (simulada)
  const tasaRetencion = Math.min(100, Math.round(Math.random() * 100));

  // Horarios pico (simulados)
  const horariosPico: Record<string, number> = {
    "Lun 09:00": 3,
    "Lun 11:00": 5,
    "Lun 14:00": 2,
    "Lun 16:00": 4,
    "Mar 09:00": 4,
    "Mar 11:00": 6,
    "Mar 14:00": 3,
    "Mar 16:00": 5,
    "Mié 09:00": 2,
    "Mié 11:00": 4,
    "Mié 14:00": 1,
    "Mié 16:00": 3,
    "Jue 09:00": 5,
    "Jue 11:00": 7,
    "Jue 14:00": 4,
    "Jue 16:00": 6,
    "Vie 09:00": 4,
    "Vie 11:00": 6,
    "Vie 14:00": 2,
    "Vie 16:00": 5,
    "Sáb 09:00": 4,
    "Sáb 11:00": 3,
    "Sáb 15:00": 2
  };

  // Tendencia de ingresos (simulada)
  const ingresosTendencia: Record<string, number> = {
    "Sem 1": ingresosGenerados * 0.7,
    "Sem 2": ingresosGenerados * 0.8,
    "Sem 3": ingresosGenerados * 0.9,
    "Sem 4": ingresosGenerados
  };

  return {
    ingresosGenerados,
    turnosCompletados,
    ticketPromedio,
    tasaUtilizacion,
    tasaRetencion,
    serviciosPopulares,
    horariosPico,
    ingresosTendencia
  };
}

/**
 * Hook para obtener estadísticas de un barbero específico
 */
export function useEstadisticasBarbero(filtros: FiltrosBarberoEstadisticas) {
  const barberoStats = useQuery({
    queryKey: ['estadisticas', 'barbero', filtros.periodo, filtros.barberoId],
    queryFn: () => fetchEstadisticasBarbero(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return { barberoStats };
}

// Tipo para las estadísticas de administrador
interface FiltrosAdminEstadisticas {
  periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
  sucursalId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Función para obtener estadísticas de administrador
async function fetchEstadisticasAdmin(
  filtros: FiltrosAdminEstadisticas
): Promise<AdminEstadisticas> {
  // Datos simulados para estadísticas de administrador
  // En una implementación real, estos datos vendrían de consultas a la base de datos
  
  const ingresosPorSucursal: Record<string, number> = {
    "Sucursal 1": 15000,
    "Sucursal 2": 12000,
    "Sucursal 3": 8000
  };
  
  const ingresosPorBarbero: Record<string, number> = {
    "Juan Pérez": 7500,
    "María García": 6800,
    "Carlos López": 5200,
    "Ana Martínez": 4800,
    "Pedro Sánchez": 3500
  };
  
  const ingresosPorServicio: Record<string, number> = {
    "Corte de cabello": 8000,
    "Barba": 4500,
    "Corte y barba": 6200,
    "Coloración": 3800,
    "Alisado": 2900
  };
  
  const turnosPorHora: Record<string, number> = {
    "09:00": 15,
    "10:00": 18,
    "11:00": 22,
    "12:00": 20,
    "13:00": 12,
    "14:00": 16,
    "15:00": 19,
    "16:00": 21,
    "17:00": 14,
    "18:00": 10
  };
  
  const productividadBarbero: Record<string, number> = {
    "Juan Pérez": 95,
    "María García": 92,
    "Carlos López": 88,
    "Ana Martínez": 85,
    "Pedro Sánchez": 80
  };
  
  const serviciosRentables: Record<string, number> = {
    "Corte y barba": 85,
    "Coloración": 78,
    "Alisado": 72,
    "Corte de cabello": 92,
    "Barba": 88
  };
  
  const distribucionClientes: Record<string, number> = {
    "Nuevos": 35,
    "Recurrentes": 45,
    "Fieles": 20
  };
  
  const ingresosTendencia: Record<string, number> = {
    "Ene": 12000,
    "Feb": 13500,
    "Mar": 14200,
    "Abr": 15800,
    "May": 16500,
    "Jun": 17200
  };

  return {
    ingresosPorSucursal,
    ingresosPorBarbero,
    ingresosPorServicio,
    turnosPorHora,
    productividadBarbero,
    serviciosRentables,
    distribucionClientes,
    ingresosTendencia
  };
}

/**
 * Hook para obtener estadísticas de administrador
 */
export function useEstadisticasAdmin(filtros: FiltrosAdminEstadisticas) {
  const adminStats = useQuery({
    queryKey: ['estadisticas', 'admin', filtros.periodo, filtros.sucursalId],
    queryFn: () => fetchEstadisticasAdmin(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return { adminStats };
}



// ============================================
// FUNCIONES DE FETCHING
// ============================================

/**
 * Fetch estadísticas de sucursales
 */
async function fetchEstadisticasSucursales(
  filtros: FiltrosEstadisticas & { idbarberia: string }
): Promise<EstadisticaSucursal[]> {
  const { idbarberia, sucursalId, fechaInicio, fechaFin } = filtros;
  
  // Validar que tengamos idbarberia
  if (!idbarberia) {
    throw new Error('ID de barbería no disponible');
  }

  // Query base para citas por sucursal
  let query = supabase
    .from('mibarber_citas')
    .select(`
      id_sucursal,
      ticket,
      estado,
      mibarber_sucursales!inner(nombre_sucursal)
    `)
    .eq('id_barberia', idbarberia);

  // Filtros opcionales
  if (sucursalId) {
    query = query.eq('id_sucursal', sucursalId);
  }
  if (fechaInicio) {
    query = query.gte('fecha', fechaInicio);
  }
  if (fechaFin) {
    query = query.lte('fecha', fechaFin);
  }

  const { data: citas, error } = await query;

  if (error) throw error;

  // Agrupar por sucursal
  const sucursalesMap = new Map<string, EstadisticaSucursal>();

  citas?.forEach((cita: any) => {
    const sucursalId = cita.id_sucursal;
    const nombreSucursal = cita.mibarber_sucursales?.nombre_sucursal || 'Sin nombre';

    if (!sucursalesMap.has(sucursalId)) {
      sucursalesMap.set(sucursalId, {
        id_sucursal: sucursalId,
        nombre_sucursal: nombreSucursal,
        total_citas: 0,
        ingresos_totales: 0,
        ingresos_promedio: 0,
        tasa_ocupacion: 0,
        ranking: 0,
      });
    }

    const stats = sucursalesMap.get(sucursalId)!;
    stats.total_citas++;

    if (cita.estado === 'completado') {
      stats.ingresos_totales += parseFloat(cita.ticket || 0);
    } else if (cita.estado === 'cancelado') {
      // Contar cancelaciones si es necesario
    }
  });

  // Calcular promedios y tasas
  sucursalesMap.forEach((stats) => {
    stats.ingresos_promedio =
      stats.total_citas > 0
        ? Math.round((stats.ingresos_totales / stats.total_citas) * 100) / 100
        : 0;
    stats.tasa_ocupacion =
      stats.total_citas > 0
        ? Math.round((stats.ingresos_totales / stats.total_citas) * 100)
        : 0;
  });

  // Convertir a array y ordenar por ingresos
  const result = Array.from(sucursalesMap.values())
    .sort((a, b) => b.ingresos_totales - a.ingresos_totales)
    .map((sucursal, index) => ({
      ...sucursal,
      ranking: index + 1,
    }));

  return result;
}

/**
 * Fetch estadísticas de caja
 */
async function fetchEstadisticasCaja(
  filtros: FiltrosEstadisticas & { idbarberia: string }
): Promise<EstadisticaCaja[]> {
  const { idbarberia, sucursalId, barberoId, fechaInicio, fechaFin } = filtros;

  let query = supabase
    .from('mibarber_citas')
    .select('ticket, metodo_pago, estado, id_barbero, barbero')
    .eq('id_barberia', idbarberia)
    .eq('estado', 'completado'); // Solo citas completadas

  if (sucursalId) {
    query = query.eq('id_sucursal', sucursalId);
  }
  if (barberoId) {
    query = query.eq('id_barbero', barberoId);
  }
  if (fechaInicio) {
    query = query.gte('fecha', fechaInicio);
  }
  if (fechaFin) {
    query = query.lte('fecha', fechaFin);
  }

  const { data: citas, error } = await query;

  if (error) throw error;

  // Agrupar por barbero
  const barberosMap = new Map<string, EstadisticaCaja>();

  citas?.forEach((cita: any) => {
    const barberoId = cita.id_barbero;
    const barberoNombre = cita.barbero || 'Sin asignar';

    if (!barberosMap.has(barberoId)) {
      barberosMap.set(barberoId, {
        id_barbero: barberoId,
        nombre_barbero: barberoNombre,
        ingresos_totales: 0,
        metodo_pago: '',
        ingresos_mes_actual: 0,
        ingresos_mes_anterior: 0,
        ticket_promedio: 0,
      });
    }

    const stats = barberosMap.get(barberoId)!;
    const ticket = parseFloat(cita.ticket || 0);
    stats.ingresos_totales += ticket;

    // Guardar método de pago más usado (simplificado)
    stats.metodo_pago = cita.metodo_pago || 'Sin especificar';
  });

  // Calcular promedios
  barberosMap.forEach((stats) => {
    const totalCitas = citas?.filter((c: any) => c.id_barbero === stats.id_barbero).length || 0;
    stats.ticket_promedio = totalCitas > 0 
      ? Math.round((stats.ingresos_totales / totalCitas) * 100) / 100
      : 0;
    stats.ingresos_mes_actual = Math.round(stats.ingresos_totales * 100) / 100;
  });

  return Array.from(barberosMap.values());
}

/**
 * Fetch estadísticas de barberos
 */
async function fetchEstadisticasBarberos(
  filtros: FiltrosEstadisticas & { idbarberia: string }
): Promise<EstadisticaBarbero[]> {
  const { idbarberia, barberoId, fechaInicio, fechaFin } = filtros;

  // Query para barberos activos
  let barberoQuery = supabase
    .from('mibarber_barberos')
    .select('id_barbero, nombre, id_sucursal')
    .eq('id_barberia', idbarberia)
    .eq('activo', true);

  if (barberoId) {
    barberoQuery = barberoQuery.eq('id_barbero', barberoId);
  }

  const { data: barberos, error: errorBarberos } = await barberoQuery;

  if (errorBarberos) throw errorBarberos;

  // Query para citas de esos barberos
  let citasQuery = supabase
    .from('mibarber_citas')
    .select('id_barbero, ticket, estado')
    .eq('id_barberia', idbarberia);

  if (barberoId) {
    citasQuery = citasQuery.eq('id_barbero', barberoId);
  }
  if (fechaInicio) {
    citasQuery = citasQuery.gte('fecha', fechaInicio);
  }
  if (fechaFin) {
    citasQuery = citasQuery.lte('fecha', fechaFin);
  }

  const { data: citas, error: errorCitas } = await citasQuery;

  if (errorCitas) throw errorCitas;

  // Mapear estadísticas por barbero
  const barberosStats: EstadisticaBarbero[] = barberos?.map((barbero: any) => {
    const citasBarbero = citas?.filter((c: any) => c.id_barbero === barbero.id_barbero) || [];
    
    const totalCitas = citasBarbero.length;
    const citasCompletadas = citasBarbero.filter((c: any) => c.estado === 'completado').length;
    const citasCanceladas = citasBarbero.filter((c: any) => c.estado === 'cancelado').length;
    
    const ingresoGenerado = citasBarbero
      .filter((c: any) => c.estado === 'completado')
      .reduce((sum: number, c: any) => sum + parseFloat(c.ticket || 0), 0);

    const tasaCancelacion = totalCitas > 0 
      ? Math.round((citasCanceladas / totalCitas) * 100) 
      : 0;

    return {
      id_barbero: barbero.id_barbero,
      nombre_barbero: barbero.nombre,
      total_citas_completadas: citasCompletadas,
      ingresos_generados: Math.round(ingresoGenerado * 100) / 100,
      promedio_valoracion: 0, // Valor por defecto, podría calcularse de otra tabla
      tasa_cancelacion: tasaCancelacion,
      horarios_productivos: [], // Valor por defecto, podría calcularse de otra manera
    };
  }) || [];

  // Ordenar por ingresos generados
  return barberosStats.sort((a, b) => b.ingresos_generados - a.ingresos_generados);
}

/**
 * Fetch estadísticas de servicios
 */
async function fetchEstadisticasServicios(
  filtros: FiltrosEstadisticas & { idbarberia: string }
): Promise<EstadisticaServicio[]> {
  const { idbarberia, sucursalId, fechaInicio, fechaFin } = filtros;

  let query = supabase
    .from('mibarber_citas')
    .select(`
      id_servicio,
      servicio,
      ticket,
      duracion,
      estado
    `)
    .eq('id_barberia', idbarberia);

  if (sucursalId) {
    query = query.eq('id_sucursal', sucursalId);
  }
  if (fechaInicio) {
    query = query.gte('fecha', fechaInicio);
  }
  if (fechaFin) {
    query = query.lte('fecha', fechaFin);
  }

  const { data: citas, error } = await query;

  if (error) throw error;

  // Agrupar por servicio
  const serviciosMap = new Map<string, EstadisticaServicio>();

  citas?.forEach((cita: any) => {
    const servicioId = cita.id_servicio || 'sin-id';
    const nombreServicio = cita.servicio || 'Sin servicio';

    if (!serviciosMap.has(servicioId)) {
      serviciosMap.set(servicioId, {
        id_servicio: servicioId,
        nombre_servicio: nombreServicio,
        total_solicitudes: 0,
        ingresos_totales: 0,
        duracion_promedio: 0,
        tasa_cancelacion: 0,
      });
    }

    const stats = serviciosMap.get(servicioId)!;
    stats.total_solicitudes++;

    if (cita.estado === 'completado') {
      stats.ingresos_totales += parseFloat(cita.ticket || 0);
    } else if (cita.estado === 'cancelado') {
      // Contar cancelaciones
    }
  });

  // Calcular promedios y tasas
  serviciosMap.forEach((stats) => {
    // Calcular tasa de cancelación
    const citasCanceladas = citas?.filter((c: any) => 
      (c.id_servicio === stats.id_servicio || (!c.id_servicio && stats.id_servicio === 'sin-id')) && 
      c.estado === 'cancelado'
    ).length || 0;
    
    stats.tasa_cancelacion = stats.total_solicitudes > 0
      ? Math.round((citasCanceladas / stats.total_solicitudes) * 100)
      : 0;
    stats.ingresos_totales = Math.round(stats.ingresos_totales * 100) / 100;
  });

  // Ordenar por veces reservado
  return Array.from(serviciosMap.values()).sort(
    (a, b) => b.total_solicitudes - a.total_solicitudes
  );
}

/**
 * Fetch estadísticas de clientes
 */
async function fetchEstadisticasClientes(
  filtros: FiltrosEstadisticas & { idbarberia: string }
): Promise<EstadisticaCliente> {
  const { idbarberia, sucursalId, fechaInicio, fechaFin } = filtros;

  // Query clientes totales
  let clientesQuery = supabase
    .from('mibarber_clientes')
    .select('id_cliente, created_at, nombre')
    .eq('id_barberia', idbarberia);

  if (sucursalId) {
    clientesQuery = clientesQuery.eq('id_sucursal', sucursalId);
  }

  const { data: clientes, error: errorClientes } = await clientesQuery;

  if (errorClientes) throw errorClientes;

  // Clientes nuevos en el período
  const clientesNuevos = clientes?.filter((c: any) => {
    const createdAt = new Date(c.created_at);
    const dentroRango =
      (!fechaInicio || createdAt >= new Date(fechaInicio)) &&
      (!fechaFin || createdAt <= new Date(fechaFin));
    return dentroRango;
  }).length || 0;

  // Query citas para analizar recurrencia
  let citasQuery = supabase
    .from('mibarber_citas')
    .select('id_cliente, estado')
    .eq('id_barberia', idbarberia)
    .eq('estado', 'completado');

  if (sucursalId) {
    citasQuery = citasQuery.eq('id_sucursal', sucursalId);
  }
  if (fechaInicio) {
    citasQuery = citasQuery.gte('fecha', fechaInicio);
  }
  if (fechaFin) {
    citasQuery = citasQuery.lte('fecha', fechaFin);
  }

  const { data: citas, error: errorCitas } = await citasQuery;

  if (errorCitas) throw errorCitas;

  // Contar visitas por cliente
  const visitasPorCliente = new Map<string, number>();
  citas?.forEach((cita: any) => {
    const idCliente = cita.id_cliente;
    visitasPorCliente.set(idCliente, (visitasPorCliente.get(idCliente) || 0) + 1);
  });

  // Clientes recurrentes (más de 1 visita)
  const clientesRecurrentes = Array.from(visitasPorCliente.values()).filter(
    (visitas) => visitas > 1
  ).length;

  // Top 5 clientes
  const clientesConVisitas = Array.from(visitasPorCliente.entries())
    .map(([idCliente, visitas]) => ({
      id_cliente: idCliente,
      nombre_cliente: clientes?.find((c: any) => c.id_cliente === idCliente)?.nombre || 'Sin nombre',
      total_visitas: visitas,
    }))
    .sort((a, b) => b.total_visitas - a.total_visitas)
    .slice(0, 5);

  // Promedio de visitas
  const totalVisitas = Array.from(visitasPorCliente.values()).reduce((a, b) => a + b, 0);
  const promedioVisitas = visitasPorCliente.size > 0
    ? Math.round((totalVisitas / visitasPorCliente.size) * 10) / 10
    : 0;

  // Tasa de retención
  const tasaRetencion = clientes && clientes.length > 0
    ? Math.round((clientesRecurrentes / clientes.length) * 100)
    : 0;

  return {
    total_clientes_unicos: clientes?.length || 0,
    clientes_nuevos: clientesNuevos,
    clientes_recurrentes: clientesRecurrentes,
    tasa_retencion: tasaRetencion,
    clientes_frecuentes: clientesConVisitas,
    promedio_visitas_por_cliente: promedioVisitas,
  };
}

/**
 * Fetch estadísticas de Bot IA (placeholder)
 */
async function fetchEstadisticasBotIA(
  filtros: FiltrosEstadisticas & { idbarberia: string }
): Promise<EstadisticaBotIA> {
  // TODO: Implementar cuando exista la tabla del bot IA
  return {
    total_interacciones: 0,
    citas_agendadas_bot: 0,
    citas_agendadas_manual: 0,
    tasa_conversion: 0,
    consultas_frecuentes: [],
    horarios_uso_bot: [],
  };
}

/**
 * Hook para obtener estadísticas de sucursales
 */
export function useEstadisticasSucursales(filtros: FiltrosEstadisticas) {
  const { idBarberia, isAdmin } = useAuth();
  
  // Log para depuración
  console.log('useEstadisticasSucursales - Parámetros:', { idBarberia, isAdmin, filtros });
  
  return useQuery({
    queryKey: ['estadisticas', 'sucursales', filtros.sucursalId, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async () => {
      // Validar que tengamos los datos necesarios
      console.log('useEstadisticasSucursales - Ejecutando fetch con:', { idBarberia, isAdmin, filtros });
      
      if (!idBarberia) {
        const error = new Error('No se ha encontrado el ID de la barbería');
        console.error('useEstadisticasSucursales - Error:', error.message);
        throw error;
      }
      if (!isAdmin) {
        const error = new Error('Solo los administradores pueden acceder a estas estadísticas');
        console.error('useEstadisticasSucursales - Error:', error.message);
        throw error;
      }
      
      const resultado = await fetchEstadisticasSucursales({
        ...filtros,
        idbarberia: idBarberia
      });
      
      console.log('useEstadisticasSucursales - Resultado:', resultado);
      return resultado;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!idBarberia && isAdmin, // Mantener la condición enabled
    retry: 1 // Limitar reintentos para evitar bucles infinitos
  });
}

/**
 * Hook para obtener estadísticas de caja
 */
export function useEstadisticasCaja(filtros: FiltrosEstadisticas) {
  const { idBarberia, isAdmin } = useAuth();
  
  // Log para depuración
  console.log('useEstadisticasCaja - Parámetros:', { idBarberia, isAdmin, filtros });
  
  return useQuery({
    queryKey: ['estadisticas', 'caja', filtros.sucursalId, filtros.barberoId, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async () => {
      // Validar que tengamos los datos necesarios
      console.log('useEstadisticasCaja - Ejecutando fetch con:', { idBarberia, isAdmin, filtros });
      
      if (!idBarberia) {
        const error = new Error('No se ha encontrado el ID de la barbería');
        console.error('useEstadisticasCaja - Error:', error.message);
        throw error;
      }
      if (!isAdmin) {
        const error = new Error('Solo los administradores pueden acceder a estas estadísticas');
        console.error('useEstadisticasCaja - Error:', error.message);
        throw error;
      }
      
      const resultado = await fetchEstadisticasCaja({
        ...filtros,
        idbarberia: idBarberia
      });
      
      console.log('useEstadisticasCaja - Resultado:', resultado);
      return resultado;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!idBarberia && isAdmin, // Mantener la condición enabled
    retry: 1 // Limitar reintentos para evitar bucles infinitos
  });
}

/**
 * Hook para obtener estadísticas de barberos
 */
export function useEstadisticasBarberos(filtros: FiltrosEstadisticas) {
  const { idBarberia, isAdmin } = useAuth();
  
  // Log para depuración
  console.log('useEstadisticasBarberos - Parámetros:', { idBarberia, isAdmin, filtros });
  
  return useQuery({
    queryKey: ['estadisticas', 'barberos', filtros.sucursalId, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async () => {
      // Validar que tengamos los datos necesarios
      console.log('useEstadisticasBarberos - Ejecutando fetch con:', { idBarberia, isAdmin, filtros });
      
      if (!idBarberia) {
        const error = new Error('No se ha encontrado el ID de la barbería');
        console.error('useEstadisticasBarberos - Error:', error.message);
        throw error;
      }
      if (!isAdmin) {
        const error = new Error('Solo los administradores pueden acceder a estas estadísticas');
        console.error('useEstadisticasBarberos - Error:', error.message);
        throw error;
      }
      
      const resultado = await fetchEstadisticasBarberos({
        ...filtros,
        idbarberia: idBarberia
      });
      
      console.log('useEstadisticasBarberos - Resultado:', resultado);
      return resultado;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!idBarberia && isAdmin, // Mantener la condición enabled
    retry: 1 // Limitar reintentos para evitar bucles infinitos
  });
}

/**
 * Hook para obtener estadísticas de servicios
 */
export function useEstadisticasServicios(filtros: FiltrosEstadisticas) {
  const { idBarberia, isAdmin } = useAuth();
  
  // Log para depuración
  console.log('useEstadisticasServicios - Parámetros:', { idBarberia, isAdmin, filtros });
  
  return useQuery({
    queryKey: ['estadisticas', 'servicios', filtros.sucursalId, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async () => {
      // Validar que tengamos los datos necesarios
      console.log('useEstadisticasServicios - Ejecutando fetch con:', { idBarberia, isAdmin, filtros });
      
      if (!idBarberia) {
        const error = new Error('No se ha encontrado el ID de la barbería');
        console.error('useEstadisticasServicios - Error:', error.message);
        throw error;
      }
      if (!isAdmin) {
        const error = new Error('Solo los administradores pueden acceder a estas estadísticas');
        console.error('useEstadisticasServicios - Error:', error.message);
        throw error;
      }
      
      const resultado = await fetchEstadisticasServicios({
        ...filtros,
        idbarberia: idBarberia
      });
      
      console.log('useEstadisticasServicios - Resultado:', resultado);
      return resultado;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!idBarberia && isAdmin, // Mantener la condición enabled
    retry: 1 // Limitar reintentos para evitar bucles infinitos
  });
}

/**
 * Hook para obtener estadísticas de clientes
 */
export function useEstadisticasClientes(filtros: FiltrosEstadisticas) {
  const { idBarberia, isAdmin } = useAuth();
  
  // Log para depuración
  console.log('useEstadisticasClientes - Parámetros:', { idBarberia, isAdmin, filtros });
  
  return useQuery({
    queryKey: ['estadisticas', 'clientes', filtros.sucursalId, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async () => {
      // Validar que tengamos los datos necesarios
      console.log('useEstadisticasClientes - Ejecutando fetch con:', { idBarberia, isAdmin, filtros });
      
      if (!idBarberia) {
        const error = new Error('No se ha encontrado el ID de la barbería');
        console.error('useEstadisticasClientes - Error:', error.message);
        throw error;
      }
      if (!isAdmin) {
        const error = new Error('Solo los administradores pueden acceder a estas estadísticas');
        console.error('useEstadisticasClientes - Error:', error.message);
        throw error;
      }
      
      const resultado = await fetchEstadisticasClientes({
        ...filtros,
        idbarberia: idBarberia
      });
      
      console.log('useEstadisticasClientes - Resultado:', resultado);
      return resultado;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!idBarberia && isAdmin, // Mantener la condición enabled
    retry: 1 // Limitar reintentos para evitar bucles infinitos
  });
}

/**
 * Hook para obtener estadísticas del Bot IA
 */
export function useEstadisticasBotIA(filtros: FiltrosEstadisticas) {
  const { idBarberia, isAdmin } = useAuth();
  
  // Log para depuración
  console.log('useEstadisticasBotIA - Parámetros:', { idBarberia, isAdmin, filtros });
  
  return useQuery({
    queryKey: ['estadisticas', 'bot-ia', filtros.sucursalId, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async () => {
      // Validar que tengamos los datos necesarios
      console.log('useEstadisticasBotIA - Ejecutando fetch con:', { idBarberia, isAdmin, filtros });
      
      if (!idBarberia) {
        const error = new Error('No se ha encontrado el ID de la barbería');
        console.error('useEstadisticasBotIA - Error:', error.message);
        throw error;
      }
      if (!isAdmin) {
        const error = new Error('Solo los administradores pueden acceder a estas estadísticas');
        console.error('useEstadisticasBotIA - Error:', error.message);
        throw error;
      }
      
      const resultado = await fetchEstadisticasBotIA({
        ...filtros,
        idbarberia: idBarberia
      });
      
      console.log('useEstadisticasBotIA - Resultado:', resultado);
      return resultado;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!idBarberia && isAdmin, // Mantener la condición enabled
    retry: 1 // Limitar reintentos para evitar bucles infinitos
  });
}