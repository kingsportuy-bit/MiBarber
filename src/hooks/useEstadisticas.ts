"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import type { Appointment, CajaRecord, Barbero, Client } from "@/types/db";

// Definir tipos para las estadísticas
export interface BarberoEstadisticas {
  ingresosGenerados: number;
  turnosCompletados: number;
  ticketPromedio: number;
  tasaUtilizacion: number;
  serviciosPopulares: Record<string, number>;
  horariosPico: Record<string, number>;
  tasaRetencion: number;
}

export interface AdminEstadisticas {
  ingresosTotales: number;
  ingresosPorSucursal: Record<string, number>;
  ingresosPorBarbero: Record<string, number>;
  ingresosPorServicio: Record<string, number>;
  tasaOcupacion: number;
  tasaCancelacion: number;
  turnosPorHora: Record<string, number>;
  productividadBarbero: Record<string, number>;
  serviciosRentables: Record<string, number>;
  distribucionClientes: Record<string, number>;
  frecuenciaVisitas: number;
  valorCliente: number;
  ingresosTendencia: Record<string, number>;
}

interface UseEstadisticasParams {
  periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
  barberoId?: string;
  sucursalId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export function useEstadisticas({ periodo, barberoId, sucursalId, fechaDesde, fechaHasta }: UseEstadisticasParams) {
  const supabase = getSupabaseClient();
  const { isAdmin, idBarberia, barbero: barberoActual } = useBarberoAuth();
  
  // Determinar el ID del barbero a usar
  const targetBarberoId = barberoId || barberoActual?.id_barbero;

  // Calcular fechas según el período o usar fechas personalizadas
  const calcularRangoFechas = () => {
    // Si se proporcionan fechas personalizadas, usarlas
    if (fechaDesde && fechaHasta) {
      return {
        desde: fechaDesde,
        hasta: fechaHasta
      };
    }
    
    // De lo contrario, calcular según el período
    const now = new Date();
    let desde: Date;
    let hasta: Date = new Date();

    switch (periodo) {
      case "diario":
        desde = new Date(now);
        desde.setHours(0, 0, 0, 0);
        break;
      case "semanal":
        desde = new Date(now);
        desde.setDate(now.getDate() - 7);
        break;
      case "mensual":
        desde = new Date(now);
        desde.setMonth(now.getMonth() - 1);
        break;
      case "trimestral":
        desde = new Date(now);
        desde.setMonth(now.getMonth() - 3);
        break;
      case "anual":
        desde = new Date(now);
        desde.setFullYear(now.getFullYear() - 1);
        break;
      default:
        desde = new Date(now);
        desde.setMonth(now.getMonth() - 1);
    }

    return {
      desde: desde.toISOString().split('T')[0],
      hasta: hasta.toISOString().split('T')[0]
    };
  };

  const { desde, hasta } = calcularRangoFechas();

  // Estadísticas para barbero individual
  const barberoStatsQuery = useQuery<BarberoEstadisticas>({
    queryKey: ["estadisticas", "barbero", targetBarberoId, periodo, desde, hasta, sucursalId],
    queryFn: async () => {
      if (!targetBarberoId) {
        throw new Error("No se especificó un barbero");
      }

      // Obtener citas completadas del barbero
      let citasQuery = (supabase as any)
        .from("mibarber_citas")
        .select("*")
        .eq("id_barbero", targetBarberoId)
        .eq("estado", "completado")
        .gte("fecha", desde)
        .lte("fecha", hasta);

      // Filtrar por sucursal si se especifica
      if (sucursalId) {
        citasQuery = citasQuery.eq("id_sucursal", sucursalId);
      }

      const { data: citas, error: citasError } = await citasQuery;

      if (citasError) throw citasError;

      // Obtener registros de caja del barbero
      let cajaQuery = (supabase as any)
        .from("mibarber_caja")
        .select("*")
        .eq("barbero", targetBarberoId)
        .gte("fecha", desde)
        .lte("fecha", hasta);

      // Filtrar por sucursal si se especifica
      if (sucursalId) {
        cajaQuery = cajaQuery.eq("id_sucursal", sucursalId);
      }

      const { data: cajaRecords, error: cajaError } = await cajaQuery;

      if (cajaError) throw cajaError;

      // Calcular estadísticas
      const ingresosGenerados = cajaRecords.reduce((sum: number, record: CajaRecord) => sum + record.monto, 0);
      const turnosCompletados = citas.length;
      const ticketPromedio = turnosCompletados > 0 ? ingresosGenerados / turnosCompletados : 0;
      
      // Servicios populares
      const serviciosPopulares: Record<string, number> = {};
      citas.forEach((cita: Appointment) => {
        const servicio = cita.servicio || "Sin especificar";
        serviciosPopulares[servicio] = (serviciosPopulares[servicio] || 0) + 1;
      });

      // Horarios pico
      const horariosPico: Record<string, number> = {};
      citas.forEach((cita: Appointment) => {
        const hora = cita.hora?.substring(0, 5) || "Sin hora";
        horariosPico[hora] = (horariosPico[hora] || 0) + 1;
      });

      // Tasa de utilización (simulada)
      const tasaUtilizacion = Math.min(100, Math.round((turnosCompletados / 20) * 100));

      // Tasa de retención (simulada)
      const tasaRetencion = Math.min(100, Math.round((turnosCompletados / 30) * 100));

      return {
        ingresosGenerados,
        turnosCompletados,
        ticketPromedio,
        tasaUtilizacion,
        serviciosPopulares,
        horariosPico,
        tasaRetencion
      };
    },
    enabled: !isAdmin && !!targetBarberoId
  });

  // Estadísticas para administrador
  const adminStatsQuery = useQuery<AdminEstadisticas>({
    queryKey: ["estadisticas", "admin", idBarberia, periodo, desde, hasta, sucursalId],
    queryFn: async () => {
      if (!idBarberia) {
        throw new Error("No se especificó una barbería");
      }

      // Obtener todas las citas
      let citasQuery = (supabase as any)
        .from("mibarber_citas")
        .select("*")
        .eq("id_barberia", idBarberia)
        .gte("fecha", desde)
        .lte("fecha", hasta);

      // Filtrar por sucursal si se especifica
      if (sucursalId) {
        citasQuery = citasQuery.eq("id_sucursal", sucursalId);
      }

      const { data: citas, error: citasError } = await citasQuery;

      if (citasError) throw citasError;

      // Obtener registros de caja
      let cajaQuery = (supabase as any)
        .from("mibarber_caja")
        .select("*")
        .eq("id_barberia", idBarberia)
        .gte("fecha", desde)
        .lte("fecha", hasta);

      // Filtrar por sucursal si se especifica
      if (sucursalId) {
        cajaQuery = cajaQuery.eq("id_sucursal", sucursalId);
      }

      const { data: cajaRecords, error: cajaError } = await cajaQuery;

      if (cajaError) throw cajaError;

      // Obtener barberos (filtrar por sucursal si se especifica)
      let barberosQuery = (supabase as any)
        .from("mibarber_barberos")
        .select("*")
        .eq("id_barberia", idBarberia);

      // Filtrar por sucursal si se especifica
      if (sucursalId) {
        barberosQuery = barberosQuery.eq("id_sucursal", sucursalId);
      }

      const { data: barberos, error: barberosError } = await barberosQuery;

      if (barberosError) throw barberosError;

      // Obtener sucursales (solo la sucursal seleccionada si se especifica)
      let sucursalesQuery = (supabase as any)
        .from("mibarber_sucursales")
        .select("*")
        .eq("id_barberia", idBarberia);

      // Filtrar por sucursal si se especifica
      if (sucursalId) {
        sucursalesQuery = sucursalesQuery.eq("id", sucursalId);
      }

      const { data: sucursales, error: sucursalesError } = await sucursalesQuery;

      if (sucursalesError) throw sucursalesError;

      // Obtener servicios para calcular rentabilidad
      const { data: servicios, error: serviciosError } = await (supabase as any)
        .from("mibarber_servicios")
        .select("*")
        .eq("id_barberia", idBarberia);

      if (serviciosError) throw serviciosError;

      // Calcular estadísticas
      const ingresosTotales = cajaRecords.reduce((sum: number, record: CajaRecord) => sum + record.monto, 0);
      
      // Ingresos por sucursal (solo mostrar la sucursal seleccionada)
      const ingresosPorSucursal: Record<string, number> = {};
      if (sucursalId) {
        // Si hay una sucursal seleccionada, solo mostrar esa
        const sucursal = sucursales?.[0];
        if (sucursal) {
          ingresosPorSucursal[sucursal.id] = cajaRecords
            .filter((record: CajaRecord) => record.id_sucursal === sucursalId)
            .reduce((sum: number, record: CajaRecord) => sum + record.monto, 0);
        }
      } else {
        // Si no hay sucursal seleccionada, mostrar todas
        cajaRecords.forEach((record: CajaRecord) => {
          const sucursalId = record.id_sucursal || "Sin sucursal";
          ingresosPorSucursal[sucursalId] = (ingresosPorSucursal[sucursalId] || 0) + record.monto;
        });
      }

      // Ingresos por barbero
      const ingresosPorBarbero: Record<string, number> = {};
      cajaRecords.forEach((record: CajaRecord) => {
        const barbero = record.barbero || "Sin barbero";
        ingresosPorBarbero[barbero] = (ingresosPorBarbero[barbero] || 0) + record.monto;
      });

      // Ingresos por servicio
      const ingresosPorServicio: Record<string, number> = {};
      citas.forEach((cita: Appointment) => {
        const servicio = cita.servicio || "Sin especificar";
        const monto = cajaRecords.find((r: CajaRecord) => r.id_cita === cita.id_cita)?.monto || 0;
        ingresosPorServicio[servicio] = (ingresosPorServicio[servicio] || 0) + monto;
      });

      // Tasa de ocupación (simulada)
      const tasaOcupacion = Math.min(100, Math.round((citas.filter((c: Appointment) => c.estado !== "cancelado").length / 200) * 100));

      // Tasa de cancelación
      const citasCanceladas = citas.filter((c: Appointment) => c.estado === "cancelado").length;
      const tasaCancelacion = citas.length > 0 ? Math.round((citasCanceladas / citas.length) * 100) : 0;

      // Turnos por hora
      const turnosPorHora: Record<string, number> = {};
      citas.forEach((cita: Appointment) => {
        const hora = cita.hora?.substring(0, 2) || "Sin hora";
        turnosPorHora[hora] = (turnosPorHora[hora] || 0) + 1;
      });

      // Productividad por barbero (ingresos por hora trabajada - simulado)
      const productividadBarbero: Record<string, number> = {};
      barberos.forEach((barbero: Barbero) => {
        const ingresos = ingresosPorBarbero[barbero.id_barbero] || 0;
        // Simulamos 40 horas de trabajo por semana
        productividadBarbero[barbero.nombre] = Math.round(ingresos / 160);
      });

      // Servicios rentables (calculados desde la base de datos)
      const serviciosRentables: Record<string, number> = {};
      servicios.forEach((servicio: any) => {
        // Calcular la rentabilidad como ingresos totales por servicio
        const ingresosServicio = ingresosPorServicio[servicio.nombre_servicio] || 0;
        // Calcular cantidad de veces que se realizó el servicio
        const cantidadServicio = Object.values(citas.filter((c: Appointment) => 
          c.servicio === servicio.nombre_servicio
        )).length;
        
        // Rentabilidad = ingresos / cantidad (ticket promedio por servicio)
        if (cantidadServicio > 0) {
          serviciosRentables[servicio.nombre_servicio] = Math.round((ingresosServicio / cantidadServicio) * 100) / 100;
        }
      });

      // Distribución de clientes por barbero
      const distribucionClientes: Record<string, number> = {};
      barberos.forEach((barbero: Barbero) => {
        const citasBarbero = citas.filter((c: Appointment) => c.id_barbero === barbero.id_barbero).length;
        distribucionClientes[barbero.nombre] = citasBarbero;
      });

      // Frecuencia de visitas (simulada)
      const frecuenciaVisitas = 2.3;

      // Valor de cliente (simulado)
      const valorCliente = 125.75;

      // Tendencia de ingresos (simulada)
      const ingresosTendencia: Record<string, number> = {
        "Ene": 12500,
        "Feb": 13200,
        "Mar": 14800,
        "Abr": 15420
      };

      return {
        ingresosTotales,
        ingresosPorSucursal,
        ingresosPorBarbero,
        ingresosPorServicio,
        tasaOcupacion,
        tasaCancelacion,
        turnosPorHora,
        productividadBarbero,
        serviciosRentables,
        distribucionClientes,
        frecuenciaVisitas,
        valorCliente,
        ingresosTendencia
      };
    },
    enabled: isAdmin && !!idBarberia
  });

  return {
    barberoStats: barberoStatsQuery,
    adminStats: adminStatsQuery,
    isAdmin,
    isLoading: isAdmin ? adminStatsQuery.isLoading : barberoStatsQuery.isLoading,
    error: isAdmin ? adminStatsQuery.error : barberoStatsQuery.error
  };
}