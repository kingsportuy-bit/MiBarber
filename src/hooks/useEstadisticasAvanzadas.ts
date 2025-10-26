"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment, CajaRecord, Client } from "@/types/db";

export type EstadisticasFiltros = {
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
  barbero?: string;
  servicio?: string;
  cliente?: string;
};

export function useEstadisticasAvanzadas(filtros: EstadisticasFiltros) {
  const supabase = getSupabaseClient();

  // Obtener citas con filtros
  const { data: citas, isLoading: isLoadingCitas } = useQuery({
    queryKey: ["estadisticasCitas", filtros],
    queryFn: async (): Promise<Appointment[]> => {
      let q = (supabase as any).from("mibarber_citas").select("*");
      
      if (filtros.barbero) q = q.eq("barbero", filtros.barbero);
      if (filtros.servicio) q = q.eq("servicio", filtros.servicio);
      if (filtros.cliente) q = q.eq("id_cliente", filtros.cliente);
      if (filtros.desde) q = q.gte("fecha", filtros.desde);
      if (filtros.hasta) q = q.lte("fecha", filtros.hasta);
      
      const { data, error } = await q;
      if (error) {
        console.error("❌ Error consultando citas:", error);
        throw error;
      }
      return data as Appointment[];
    },
  });

  // Obtener registros de caja con filtros
  const { data: cajaRecords, isLoading: isLoadingCaja } = useQuery({
    queryKey: ["estadisticasCaja", filtros],
    queryFn: async (): Promise<CajaRecord[]> => {
      let q = (supabase as any).from("mibarber_caja").select("*");
      
      if (filtros.desde) {
        const desdeDate = new Date(filtros.desde);
        q = q.gte("fecha", desdeDate.toISOString());
      }
      
      if (filtros.hasta) {
        const hastaDate = new Date(filtros.hasta);
        hastaDate.setDate(hastaDate.getDate() + 1); // Incluir todo el día
        q = q.lt("fecha", hastaDate.toISOString());
      }
      
      const { data, error } = await q;
      if (error) {
        console.error("❌ Error consultando caja:", error);
        throw error;
      }
      return data as CajaRecord[];
    },
  });

  // Obtener clientes
  const { data: clientes, isLoading: isLoadingClientes } = useQuery({
    queryKey: ["estadisticasClientes", filtros],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await (supabase as any).from("mibarber_clientes").select("*");
      if (error) {
        console.error("❌ Error consultando clientes:", error);
        throw error;
      }
      return data as Client[];
    },
  });

  // Obtener barberos
  const { data: barberos, isLoading: isLoadingBarberos } = useQuery({
    queryKey: ["estadisticasBarberos", filtros],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await (supabase as any).from("mibarber_barberos").select("*");
      if (error) {
        console.error("❌ Error consultando barberos:", error);
        throw error;
      }
      return data as any[];
    },
  });

  const isLoading = isLoadingCitas || isLoadingCaja || isLoadingClientes || isLoadingBarberos;

  return { 
    citas: citas || [], 
    cajaRecords: cajaRecords || [], 
    clientes: clientes || [], 
    barberos: barberos || [],
    isLoading 
  };
}