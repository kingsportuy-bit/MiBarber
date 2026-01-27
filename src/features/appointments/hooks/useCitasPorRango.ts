// Hook para obtener citas por rango de fechas
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from '@/types/db';
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import type { CitasPorRangoParams } from '../types';

export interface UseCitasPorRangoResult {
  data: Appointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCitasPorRango({
  sucursalId,
  fechaInicio,
  fechaFin,
  barberoId
}: CitasPorRangoParams & { barberoId?: string }): UseCitasPorRangoResult {
  const supabase = getSupabaseClient();
  const { barbero: barberoActual, isAdmin, idBarberia } = useBarberoAuth();

  const queryResult = useQuery({
    queryKey: ["citas-rango", sucursalId, fechaInicio, fechaFin, barberoId || barberoActual?.id_barbero, isAdmin],
    queryFn: async () => {
      if (!fechaInicio || !fechaFin) {
        return [];
      }
      
      let q = (supabase as any).from("mibarber_citas").select("*");
      
      // Si se proporciona una sucursal, filtrar por ella
      if (sucursalId) {
        q = q.eq("id_sucursal", sucursalId);
      }
      
      // Filtrar por rango de fechas
      q = q.gte("fecha", fechaInicio).lte("fecha", fechaFin);
      
      // Si se proporciona barberoId, filtrar por ese barbero
      if (barberoId) {
        q = q.eq("id_barbero", barberoId);
      }
      // Si no se proporciona barberoId y el usuario no es administrador, solo mostrar sus propias citas
      else if (!isAdmin && barberoActual?.id_barbero) {
        q = q.eq("id_barbero", barberoActual.id_barbero);
      }
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        q = q.eq("id_barberia", idBarberia);
      }
      
      const { data, error } = await q.order("fecha", { ascending: true });
      if (error) throw error;
      
      return data as Appointment[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
}