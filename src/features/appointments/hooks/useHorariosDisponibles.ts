// Hook para obtener horarios disponibles
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from '@/types/db';
import type { HorariosDisponiblesParams } from '../types';

export interface UseHorariosDisponiblesResult {
  data: Appointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHorariosDisponibles({
  sucursalId,
  fecha,
  barberoId
}: HorariosDisponiblesParams): UseHorariosDisponiblesResult {
  const supabase = getSupabaseClient();

  const queryResult = useQuery({
    queryKey: ["horarios-disponibles", sucursalId, fecha, barberoId],
    queryFn: async () => {
      if (!sucursalId || !fecha) {
        return [];
      }
      
      let q = (supabase as any).from("mibarber_citas").select("*");
      
      // Filtrar por sucursal
      q = q.eq("id_sucursal", sucursalId);
      
      // Filtrar por fecha
      q = q.eq("fecha", fecha);
      
      // Si se especifica un barbero, filtrar por él
      if (barberoId) {
        q = q.eq("id_barbero", barberoId);
      }
      
      const { data, error } = await q.order("hora", { ascending: true });
      if (error) throw error;
      
      return data as Appointment[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
}