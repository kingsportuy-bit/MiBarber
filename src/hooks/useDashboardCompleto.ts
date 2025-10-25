"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getLocalDateString } from "@/utils/dateUtils"; // Importar la utilidad de fecha
import type { Appointment, CajaRecord } from "@/types/db";

export function useDashboardCompleto() {
  const supabase = getSupabaseClient();

  // Obtener citas de hoy
  const { data: citasHoy, isLoading: isLoadingCitas } = useQuery({
    queryKey: ["dashboardCitasHoy"],
    queryFn: async (): Promise<Appointment[]> => {
      // Usar la utilidad de fecha corregida para zona horaria
      const hoy = getLocalDateString();
      
      const { data, error } = await (supabase as any)
        .from("mibarber_citas")
        .select("*")
        .eq("fecha", hoy);
      
      if (error) {
        console.error("❌ Error consultando citas de hoy:", error);
        throw error;
      }
      
      return data as Appointment[];
    },
  });

  // Obtener ingresos de hoy
  const { data: ingresosHoy, isLoading: isLoadingIngresos } = useQuery({
    queryKey: ["dashboardIngresosHoy"],
    queryFn: async (): Promise<CajaRecord[]> => {
      // Usar la utilidad de fecha corregida para zona horaria
      const hoy = getLocalDateString();
      
      const { data, error } = await (supabase as any)
        .from("mibarber_caja")
        .select("*")
        .gte("fecha", `${hoy}T00:00:00`)
        .lte("fecha", `${hoy}T23:59:59`);
      
      if (error) {
        console.error("❌ Error consultando ingresos de hoy:", error);
        throw error;
      }
      
      return data as CajaRecord[];
    },
  });

  // Obtener próximas citas
  const { data: proximasCitas, isLoading: isLoadingProximas } = useQuery({
    queryKey: ["dashboardProximasCitas"],
    queryFn: async (): Promise<Appointment[]> => {
      // Usar la utilidad de fecha corregida para zona horaria
      const hoy = getLocalDateString();
      
      const { data, error } = await (supabase as any)
        .from("mibarber_citas")
        .select("*")
        .gt("fecha", hoy)
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true })
        .limit(5);
      
      if (error) {
        console.error("❌ Error consultando próximas citas:", error);
        throw error;
      }
      
      return data as Appointment[];
    },
  });

  // Obtener citas de la semana
  const { data: citasSemana, isLoading: isLoadingSemana } = useQuery({
    queryKey: ["dashboardCitasSemana"],
    queryFn: async (): Promise<Appointment[]> => {
      const hoy = new Date();
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6); // Domingo
      
      // Usar la utilidad de fecha corregida para zona horaria
      const inicioSemanaStr = getLocalDateString(inicioSemana);
      const finSemanaStr = getLocalDateString(finSemana);
      
      const { data, error } = await (supabase as any)
        .from("mibarber_citas")
        .select("*")
        .gte("fecha", inicioSemanaStr)
        .lte("fecha", finSemanaStr)
        .order("fecha", { ascending: true });
      
      if (error) {
        console.error("❌ Error consultando citas de la semana:", error);
        throw error;
      }
      
      return data as Appointment[];
    },
  });

  const isLoading = isLoadingCitas || isLoadingIngresos || isLoadingProximas || isLoadingSemana;

  return { 
    citasHoy: citasHoy || [], 
    ingresosHoy: ingresosHoy || [], 
    proximasCitas: proximasCitas || [], 
    citasSemana: citasSemana || [],
    isLoading 
  };
}