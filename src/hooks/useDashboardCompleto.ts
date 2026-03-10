"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getLocalDateString } from "@/utils/dateUtils"; // utility for local date strings
import type { Appointment, CajaRecord } from "@/types/db";

export function useDashboardCompleto() {
  const supabase = getSupabaseClient();

  // Helper to fetch data with error handling
  const fetchData = async (table: string, select: string = "*", filters: any[] = []) => {
    let query = (supabase as any).from(table).select(select);
    for (const f of filters) {
      const [method, column, value] = f;
      query = query[method](column, value);
    }
    const { data, error } = await query;
    if (error) {
      console.error(`❌ Error fetching ${table}:`, error);
      throw error;
    }
    return data;
  };

  // Citas de hoy
  const { data: citasHoy, isLoading: isLoadingCitas, refetch: refetchCitasHoy } = useQuery({
    queryKey: ["dashboardCitasHoy"],
    queryFn: async (): Promise<Appointment[]> => {
      const hoy = getLocalDateString();
      return (await fetchData("mibarber_citas", "*", [["eq", "fecha", hoy]])) as Appointment[];
    },
    refetchInterval: 60000,
  });

  // Ingresos de hoy
  const { data: ingresosHoy, isLoading: isLoadingIngresos, refetch: refetchIngresosHoy } = useQuery({
    queryKey: ["dashboardIngresosHoy"],
    queryFn: async (): Promise<CajaRecord[]> => {
      const hoy = getLocalDateString();
      return (await fetchData("mibarber_caja", "*", [
        ["gte", "fecha", `${hoy}T00:00:00`],
        ["lte", "fecha", `${hoy}T23:59:59`],
      ])) as CajaRecord[];
    },
    refetchInterval: 60000,
  });

  // Próximas citas (mañana en adelante)
  const { data: proximasCitas, isLoading: isLoadingProximas, refetch: refetchProximas } = useQuery({
    queryKey: ["dashboardProximasCitas"],
    queryFn: async (): Promise<Appointment[]> => {
      const hoy = getLocalDateString();
      return (await fetchData("mibarber_citas", "*", [
        ["gt", "fecha", hoy],
        ["order", "fecha", { ascending: true }],
        ["order", "hora", { ascending: true }],
        ["limit", 20],
      ])) as Appointment[];
    },
    refetchInterval: 60000,
  });

  // Citas de la semana
  const { data: citasSemana, isLoading: isLoadingSemana, refetch: refetchSemana } = useQuery({
    queryKey: ["dashboardCitasSemana"],
    queryFn: async (): Promise<Appointment[]> => {
      const hoy = new Date();
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // lunes
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6); // domingo
      const inicioStr = getLocalDateString(inicioSemana);
      const finStr = getLocalDateString(finSemana);
      return (await fetchData("mibarber_citas", "*", [
        ["gte", "fecha", inicioStr],
        ["lte", "fecha", finStr],
        ["order", "fecha", { ascending: true }],
      ])) as Appointment[];
    },
    refetchInterval: 60000,
  });

  // Citas del mes
  const { data: citasMes, isLoading: isLoadingMes, refetch: refetchMes } = useQuery({
    queryKey: ["dashboardCitasMes"],
    queryFn: async (): Promise<Appointment[]> => {
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const inicioStr = getLocalDateString(inicioMes);
      const finStr = getLocalDateString(finMes);
      return (await fetchData("mibarber_citas", "*", [
        ["gte", "fecha", inicioStr],
        ["lte", "fecha", finStr],
        ["order", "fecha", { ascending: true }],
      ])) as Appointment[];
    },
    refetchInterval: 60000,
  });

  // Ingresos del mes
  const { data: ingresosMes, isLoading: isLoadingIngresosMes, refetch: refetchIngresosMes } = useQuery({
    queryKey: ["dashboardIngresosMes"],
    queryFn: async (): Promise<CajaRecord[]> => {
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const inicioStr = getLocalDateString(inicioMes);
      const finStr = getLocalDateString(finMes);
      return (await fetchData("mibarber_caja", "*", [
        ["gte", "fecha", `${inicioStr}T00:00:00`],
        ["lte", "fecha", `${finStr}T23:59:59`],
      ])) as CajaRecord[];
    },
    refetchInterval: 60000,
  });

  // Ingreso estimado del mes (sum of tickets for completed/pending/confirmado)
  const ingresoEstimadoMes = citasMes ? citasMes.reduce((acc, cita) => {
    if (["completado", "pendiente", "confirmado"].includes(cita.estado)) {
      return acc + (Number(cita.ticket) || 0);
    }
    return acc;
  }, 0) : 0;

  const isLoading =
    isLoadingCitas ||
    isLoadingIngresos ||
    isLoadingProximas ||
    isLoadingSemana ||
    isLoadingMes ||
    isLoadingIngresosMes;

  const refetch = () => {
    refetchCitasHoy();
    refetchIngresosHoy();
    refetchProximas();
    refetchSemana();
    refetchMes();
    refetchIngresosMes();
  };

  return {
    citasHoy: citasHoy || [],
    ingresosHoy: ingresosHoy || [],
    proximasCitas: proximasCitas || [],
    citasSemana: citasSemana || [],
    citasMes: citasMes || [],
    ingresosMes: ingresosMes || [],
    ingresoEstimadoMes,
    isLoading,
    refetch,
  };
}