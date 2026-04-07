"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getLocalDateString } from "@/utils/dateUtils";
import type { Appointment, CajaRecord } from "@/types/db";

// Read id_sucursal from the session cookie
function getSessionSucursalId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith("barber_auth_session="))
      ?.split("=")
      .slice(1)
      .join("=");
    if (!raw) return null;
    const session = JSON.parse(decodeURIComponent(raw));
    return session?.user?.id_sucursal ?? null;
  } catch {
    return null;
  }
}

export function useDashboardCompleto() {
  const supabase = getSupabaseClient();
  const idSucursal = getSessionSucursalId();

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

  // Base filter — every query must be scoped to the current sucursal
  const sf = idSucursal ? [["eq", "id_sucursal", idSucursal]] : [];

  // ── Citas de hoy ─────────────────────────────────────────────────────────
  const { data: citasHoy, isLoading: isLoadingCitas, refetch: refetchCitasHoy } = useQuery({
    queryKey: ["dashboardCitasHoy", idSucursal],
    queryFn: async (): Promise<Appointment[]> => {
      if (!idSucursal) return [];
      const hoy = getLocalDateString();
      return (await fetchData("mibarber_citas", "*", [...sf, ["eq", "fecha", hoy]])) as Appointment[];
    },
    refetchInterval: 60000,
  });

  // ── Ingresos de hoy ───────────────────────────────────────────────────────
  const { data: ingresosHoy, isLoading: isLoadingIngresos, refetch: refetchIngresosHoy } = useQuery({
    queryKey: ["dashboardIngresosHoy", idSucursal],
    queryFn: async (): Promise<CajaRecord[]> => {
      if (!idSucursal) return [];
      const hoy = getLocalDateString();
      return (await fetchData("mibarber_caja", "*", [
        ...sf,
        ["gte", "fecha", `${hoy}T00:00:00`],
        ["lte", "fecha", `${hoy}T23:59:59`],
      ])) as CajaRecord[];
    },
    refetchInterval: 60000,
  });

  // ── Próximas citas ────────────────────────────────────────────────────────
  const { data: proximasCitas, isLoading: isLoadingProximas, refetch: refetchProximas } = useQuery({
    queryKey: ["dashboardProximasCitas", idSucursal],
    queryFn: async (): Promise<Appointment[]> => {
      if (!idSucursal) return [];
      const hoy = getLocalDateString();
      return (await fetchData("mibarber_citas", "*", [
        ...sf,
        ["gt", "fecha", hoy],
        ["order", "fecha", { ascending: true }],
        ["order", "hora", { ascending: true }],
        ["limit", 20],
      ])) as Appointment[];
    },
    refetchInterval: 60000,
  });

  // ── Citas de la semana ───────────────────────────────────────────────────
  const { data: citasSemana, isLoading: isLoadingSemana, refetch: refetchSemana } = useQuery({
    queryKey: ["dashboardCitasSemana", idSucursal],
    queryFn: async (): Promise<Appointment[]> => {
      if (!idSucursal) return [];
      const hoy = new Date();
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      return (await fetchData("mibarber_citas", "*", [
        ...sf,
        ["gte", "fecha", getLocalDateString(inicioSemana)],
        ["lte", "fecha", getLocalDateString(finSemana)],
        ["order", "fecha", { ascending: true }],
      ])) as Appointment[];
    },
    refetchInterval: 60000,
  });

  // ── Citas del mes ────────────────────────────────────────────────────────
  const { data: citasMes, isLoading: isLoadingMes, refetch: refetchMes } = useQuery({
    queryKey: ["dashboardCitasMes", idSucursal],
    queryFn: async (): Promise<Appointment[]> => {
      if (!idSucursal) return [];
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return (await fetchData("mibarber_citas", "*", [
        ...sf,
        ["gte", "fecha", getLocalDateString(inicioMes)],
        ["lte", "fecha", getLocalDateString(finMes)],
        ["order", "fecha", { ascending: true }],
      ])) as Appointment[];
    },
    refetchInterval: 60000,
  });

  // ── Ingresos del mes ─────────────────────────────────────────────────────
  const { data: ingresosMes, isLoading: isLoadingIngresosMes, refetch: refetchIngresosMes } = useQuery({
    queryKey: ["dashboardIngresosMes", idSucursal],
    queryFn: async (): Promise<CajaRecord[]> => {
      if (!idSucursal) return [];
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return (await fetchData("mibarber_caja", "*", [
        ...sf,
        ["gte", "fecha", `${getLocalDateString(inicioMes)}T00:00:00`],
        ["lte", "fecha", `${getLocalDateString(finMes)}T23:59:59`],
      ])) as CajaRecord[];
    },
    refetchInterval: 60000,
  });

  // ── Citas del mes pasado ─────────────────────────────────────────────────
  const { data: citasMesPasado, isLoading: isLoadingCitasMesPasado, refetch: refetchCitasMesPasado } = useQuery({
    queryKey: ["dashboardCitasMesPasado", idSucursal],
    queryFn: async (): Promise<Appointment[]> => {
      if (!idSucursal) return [];
      const now = new Date();
      const inicioMesPasado = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const finMesPasado = new Date(now.getFullYear(), now.getMonth(), 0);
      return (await fetchData("mibarber_citas", "*", [
        ...sf,
        ["gte", "fecha", getLocalDateString(inicioMesPasado)],
        ["lte", "fecha", getLocalDateString(finMesPasado)],
      ])) as Appointment[];
    },
    refetchInterval: 60000,
  });

  // ── Ingresos del mes pasado ───────────────────────────────────────────────
  const { data: ingresosMesPasado, isLoading: isLoadingIngresosMesPasado, refetch: refetchIngresosMesPasado } = useQuery({
    queryKey: ["dashboardIngresosMesPasado", idSucursal],
    queryFn: async (): Promise<CajaRecord[]> => {
      if (!idSucursal) return [];
      const now = new Date();
      const inicioMesPasado = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const finMesPasado = new Date(now.getFullYear(), now.getMonth(), 0);
      return (await fetchData("mibarber_caja", "*", [
        ...sf,
        ["gte", "fecha", `${getLocalDateString(inicioMesPasado)}T00:00:00`],
        ["lte", "fecha", `${getLocalDateString(finMesPasado)}T23:59:59`],
      ])) as CajaRecord[];
    },
    refetchInterval: 60000,
  });

  // ── Derived values ───────────────────────────────────────────────────────
  const ingresoEstimadoMes = citasMes ? citasMes.reduce((acc, cita) => {
    if (["completado", "pendiente", "confirmada"].includes(cita.estado)) {
      return acc + (Number(cita.ticket) || 0);
    }
    return acc;
  }, 0) : 0;

  const diaActual = new Date().getDate();

  const ingresoMesPasadoAlDia = (ingresosMesPasado || []).reduce((sum: number, r: any) => {
    const fecha = new Date(r.fecha);
    if (fecha.getDate() <= diaActual) {
      const monto = Number(r.monto || r.ticket || 0);
      return sum + (r.tipo === "egreso" ? -monto : monto);
    }
    return sum;
  }, 0);

  const completadosMesPasadoAlDia = (citasMesPasado || []).filter((c: Appointment) => {
    const fecha = c.fecha?.split('T')[0];
    if (!fecha) return false;
    const dia = parseInt(fecha.split('-')[2], 10);
    return dia <= diaActual && c.estado === "completado";
  }).length;

  const isLoading =
    isLoadingCitas || isLoadingIngresos || isLoadingProximas ||
    isLoadingSemana || isLoadingMes || isLoadingIngresosMes ||
    isLoadingCitasMesPasado || isLoadingIngresosMesPasado;

  const refetch = () => {
    refetchCitasHoy(); refetchIngresosHoy(); refetchProximas();
    refetchSemana(); refetchMes(); refetchIngresosMes();
    refetchCitasMesPasado(); refetchIngresosMesPasado();
  };

  return {
    citasHoy: citasHoy || [],
    ingresosHoy: ingresosHoy || [],
    proximasCitas: proximasCitas || [],
    citasSemana: citasSemana || [],
    citasMes: citasMes || [],
    ingresosMes: ingresosMes || [],
    ingresoEstimadoMes,
    ingresoMesPasadoAlDia,
    completadosMesPasadoAlDia,
    isLoading,
    refetch,
  };
}