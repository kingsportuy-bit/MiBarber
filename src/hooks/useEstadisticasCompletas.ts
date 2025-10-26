"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment, Client } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export type EstadisticasFiltros = {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
  barbero?: string;
  servicio?: string;
  cliente?: string;
};

export function useEstadisticasCompletas(filtros: EstadisticasFiltros) {
  const supabase = getSupabaseClient();
  const { idBarberia } = useBarberoAuth();

  const { data: citas, isLoading: isLoadingCitas } = useQuery({
    queryKey: ["estadisticasCitas", filtros, idBarberia],
    queryFn: async (): Promise<Appointment[]> => {
      let q = (supabase as any).from("mibarber_citas").select("*");
      
      // Filtrar por barbero usando el ID numérico
      if (filtros.barbero) {
        q = q.eq("barbero", parseInt(filtros.barbero));
      }
      
      // Solo citas completadas
      q = q.eq("estado", "completado");
      
      if (filtros.servicio) q = q.eq("servicio", filtros.servicio);
      if (filtros.cliente) q = q.eq("id_cliente", filtros.cliente);
      if (filtros.desde) q = q.gte("fecha", filtros.desde);
      if (filtros.hasta) q = q.lte("fecha", filtros.hasta);
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        q = q.eq("id_barberia", idBarberia);
      }
      
      const { data, error } = await q;
      if (error) {
        console.error("❌ Error consultando citas:", error);
        throw error;
      }
      return data as Appointment[];
    },
  });

  // Obtener clientes
  const { data: clientes, isLoading: isLoadingClientes } = useQuery({
    queryKey: ["estadisticasClientes", idBarberia],
    queryFn: async (): Promise<Client[]> => {
      let q = (supabase as any).from("mibarber_clientes").select("*");
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        q = q.eq("id_barberia", idBarberia);
      }
      
      const { data, error } = await q;
      if (error) {
        console.error("❌ Error consultando clientes:", error);
        throw error;
      }
      return data as Client[];
    },
  });

  const kpis = useMemo(() => {
    const citasData = citas || [];
    const clientesData = clientes || [];
    
    // KPIs básicos
    const totalCitas = citasData.length;
    const totalClientes = clientesData.length;
    
    // Ticket promedio
    const sumaTickets = citasData.reduce((sum, cita) => sum + (cita.ticket || 0), 0);
    const ticketPromedio = totalCitas > 0 ? sumaTickets / totalCitas : 0;
    
    // Servicios más populares
    const serviciosPopulares = citasData.reduce((acc, cita) => {
      const servicio = cita.servicio || "Sin especificar";
      acc[servicio] = (acc[servicio] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Clientes frecuentes
    const clientesFrecuentes = citasData.reduce((acc, cita) => {
      if (cita.id_cliente) {
        acc[cita.id_cliente] = (acc[cita.id_cliente] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Ingresos totales
    const ingresosTotales = sumaTickets;
    
    // Citas por día de la semana
    const citasPorDia = citasData.reduce((acc, cita) => {
      const dia = new Date(cita.fecha).getDay();
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const nombreDia = dias[dia];
      acc[nombreDia] = (acc[nombreDia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Horas pico
    const horasPico = citasData.reduce((acc, cita) => {
      const hora = cita.hora.split(':')[0]; // Extraer la hora
      acc[hora] = (acc[hora] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalCitas,
      totalClientes,
      ticketPromedio,
      serviciosPopulares,
      clientesFrecuentes,
      ingresosTotales,
      citasPorDia,
      horasPico
    };
  }, [citas, clientes]);

  const isLoading = isLoadingCitas || isLoadingClientes;

  return { 
    citas: citas || [], 
    clientes: clientes || [], 
    kpis, 
    isLoading 
  };
}