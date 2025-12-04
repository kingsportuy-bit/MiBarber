import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface BarberoEstadisticas {
  ingresosGenerados: number;
  turnosCompletados: number;
  ticketPromedio: number;
  tasaUtilizacion: number;
  tasaRetencion: number;
  serviciosPopulares: Record<string, number>;
}

export interface AdminEstadisticas {
  ingresosTotales: number;
  ingresosPorSucursal: Record<string, number>;
  ingresosPorBarbero: Record<string, number>;
  ingresosPorServicio: Record<string, number>;
  ingresosTendencia: Record<string, number>;
  turnosPorEstado: Record<string, number>;
  turnosPorHora: Record<string, number>;
  productividadBarbero: Record<string, number>;
  serviciosRentables: Record<string, number>;
  distribucionClientes: Record<string, number>;
  tasaOcupacion: number;
  tasaCancelacion: number;
}

interface UseEstadisticasParams {
  periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
  barberoId?: string;
  sucursalId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export function useEstadisticas({ 
  periodo, 
  barberoId, 
  sucursalId,
  fechaDesde,
  fechaHasta
}: UseEstadisticasParams) {
  // Calcular fechas según el período
  const calcularRangoFechas = () => {
    const ahora = new Date();
    let fechaInicio = new Date();
    let fechaFin = new Date();

    switch (periodo) {
      case "diario":
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      case "semanal":
        fechaInicio.setDate(ahora.getDate() - ahora.getDay());
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setDate(fechaInicio.getDate() + 6);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      case "mensual":
        fechaInicio.setDate(1);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setMonth(fechaFin.getMonth() + 1);
        fechaFin.setDate(0);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      case "trimestral":
        fechaInicio.setMonth(fechaInicio.getMonth() - 3);
        fechaInicio.setDate(1);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setMonth(fechaFin.getMonth() + 1);
        fechaFin.setDate(0);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      case "anual":
        fechaInicio.setMonth(0, 1);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setMonth(11, 31);
        fechaFin.setHours(23, 59, 59, 999);
        break;
    }

    // Si se proporcionan fechas personalizadas, usarlas
    if (fechaDesde) {
      fechaInicio = new Date(fechaDesde);
    }
    if (fechaHasta) {
      fechaFin = new Date(fechaHasta);
    }

    return {
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString()
    };
  };

  const { fechaInicio, fechaFin } = calcularRangoFechas();

  // Query para estadísticas de barbero individual
  const barberoStats = useQuery({
    queryKey: ['barbero-stats', barberoId, periodo, fechaInicio, fechaFin],
    queryFn: async (): Promise<BarberoEstadisticas> => {
      if (!barberoId) {
        throw new Error('Se requiere ID de barbero');
      }

      // Obtener citas completadas
      const { data: citasCompletadas, error: citasError } = await supabase
        .from('mibarber_citas')
        .select('ticket, duracion, id_cliente, fecha')
        .eq('id_barbero', barberoId)
        .eq('estado', 'completado')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin);

      if (citasError) throw citasError;

      // Calcular ingresos generados
      const ingresosGenerados = citasCompletadas?.reduce((sum, cita) => sum + (Number(cita.ticket) || 0), 0) || 0;

      // Calcular turnos completados
      const turnosCompletados = citasCompletadas?.length || 0;

      // Calcular ticket promedio
      const ticketPromedio = turnosCompletados > 0 ? ingresosGenerados / turnosCompletados : 0;

      // Calcular tasa de utilización (simulada)
      const horasTrabajadas = citasCompletadas?.reduce((sum, cita) => {
        if (!cita.duracion) return sum;
        
        // Si es solo número (minutos)
        if (/^\d+$/.test(cita.duracion)) {
          return sum + Number(cita.duracion);
        }
        
        // Si es formato HH:MM
        const [horas, minutos] = cita.duracion.split(':').map(Number);
        return sum + (horas * 60) + minutos;
      }, 0) || 0;

      const horasTotales = 40 * 60; // 40 horas semanales como ejemplo
      const tasaUtilizacion = (horasTrabajadas / horasTotales) * 100;

      // Calcular tasa de retención (simulada)
      const clientesUnicos = new Set(citasCompletadas?.map(cita => cita.id_cliente)).size;
      const citasTotales = citasCompletadas?.length || 0;
      const tasaRetencion = clientesUnicos > 0 ? (clientesUnicos / citasTotales) * 100 : 0;

      // Servicios populares (simulados)
      const serviciosPopulares = {
        'Corte de cabello': 45,
        'Barba': 32,
        'Cejas': 18,
        'Bigote': 12,
        'Combo completo': 28
      };

      return {
        ingresosGenerados,
        turnosCompletados,
        ticketPromedio,
        tasaUtilizacion,
        tasaRetencion,
        serviciosPopulares
      };
    },
    enabled: !!barberoId
  });

  // Query para estadísticas de administrador
  const adminStats = useQuery({
    queryKey: ['admin-stats', sucursalId, periodo, fechaInicio, fechaFin],
    queryFn: async (): Promise<AdminEstadisticas> => {
      // Implementación básica de estadísticas para administrador
      return {
        ingresosTotales: 0,
        ingresosPorSucursal: {},
        ingresosPorBarbero: {},
        ingresosPorServicio: {},
        ingresosTendencia: {},
        turnosPorEstado: {},
        turnosPorHora: {},
        productividadBarbero: {},
        serviciosRentables: {},
        distribucionClientes: {},
        tasaOcupacion: 0,
        tasaCancelacion: 0
      };
    },
    enabled: false // Deshabilitado por ahora hasta que se implemente completamente
  });

  return {
    barberoStats,
    adminStats
  };
}