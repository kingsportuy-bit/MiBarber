"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from "@/types/db";

export type EstadisticasFiltros = {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
  barbero?: string;
  servicio?: string;
};

export function useEstadisticas(filtros: EstadisticasFiltros) {
  const supabase = getSupabaseClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["estadisticas", filtros],
    queryFn: async (): Promise<Appointment[]> => {
      let q = (supabase as any).from("mibarber_citas").select("*");
      if (filtros.barbero) q = q.eq("barbero", filtros.barbero);
      if (filtros.servicio) q = q.eq("servicio", filtros.servicio);
      if (filtros.desde) q = q.gte("fecha", filtros.desde);
      if (filtros.hasta) q = q.lte("fecha", filtros.hasta);
      const { data, error } = await q;
      if (error) {
        console.error("❌ Error consultando estadísticas:", error);
        throw error;
      }
      return data as Appointment[];
    },
  });

  const kpis = useMemo(() => {
    const citas = data || [];
    const totalCitas = citas.length;
    
    // Calcular total de clientes únicos
    const clientesUnicos = new Set(citas.map(cita => cita.id_cliente)).size;
    
    // Calcular ticket promedio
    let sumaTicket = 0;
    let countConTicket = 0;
    citas.forEach(cita => {
      if (cita.ticket && cita.ticket > 0) {
        sumaTicket += cita.ticket;
        countConTicket++;
      }
    });
    const ticketPromedio = countConTicket > 0 ? sumaTicket / countConTicket : 0;
    
    // Calcular servicios populares
    const serviciosPopulares: Record<string, number> = {};
    citas.forEach(cita => {
      const servicio = cita.servicio || "Sin especificar";
      serviciosPopulares[servicio] = (serviciosPopulares[servicio] || 0) + 1;
    });
    
    // Calcular clientes frecuentes
    const clientesFrecuentes: Record<string, number> = {};
    citas.forEach(cita => {
      if (cita.id_cliente) {
        clientesFrecuentes[cita.id_cliente] = (clientesFrecuentes[cita.id_cliente] || 0) + 1;
      }
    });
    
    // Calcular ingresos totales (asumiendo que el ticket representa los ingresos por cita)
    const ingresosTotales = sumaTicket;
    
    // Calcular citas por día
    const citasPorDia: Record<string, number> = {};
    citas.forEach(cita => {
      if (cita.fecha) {
        // Obtener el día de la semana
        const fecha = new Date(cita.fecha);
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dia = dias[fecha.getDay()];
        citasPorDia[dia] = (citasPorDia[dia] || 0) + 1;
      }
    });
    
    // Calcular horas pico
    const horasPico: Record<string, number> = {};
    citas.forEach(cita => {
      if (cita.hora) {
        // Extraer la hora de la cadena de tiempo (HH:MM)
        const hora = cita.hora.split(':')[0];
        horasPico[hora] = (horasPico[hora] || 0) + 1;
      }
    });

    return {
      totalCitas,
      totalClientes: clientesUnicos,
      ticketPromedio,
      serviciosPopulares,
      clientesFrecuentes,
      ingresosTotales,
      citasPorDia,
      horasPico,
    };
  }, [data]);

  return { data: data || [], kpis, isLoading, error };
}