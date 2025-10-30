// Hook para obtener la lista de citas
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment, PaginatedResponse } from '@/types/db';
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

interface UseCitasListResult {
  data: Appointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseCitasListProps {
  sucursalId?: string;
  fecha?: string;
  barberoId?: string;
  page?: number;
  pageSize?: number;
}

export function useCitasList({
  sucursalId,
  fecha,
  barberoId,
  page = 1,
  pageSize = 100 // Aumentar el tamaño de página para obtener más citas
}: UseCitasListProps): UseCitasListResult {
  const supabase = getSupabaseClient();
  const { barbero: barberoActual, isAdmin, idBarberia } = useBarberoAuth();

  const queryResult = useQuery({
    queryKey: ["citas", sucursalId, fecha, barberoId, barberoActual?.id_barbero, isAdmin, idBarberia, page, pageSize],
    queryFn: async () => {
      let q = (supabase as any).from("mibarber_citas").select("*", { count: "exact" });
      
      // Si se proporciona una sucursal, filtrar por ella
      if (sucursalId) {
        q = q.eq("id_sucursal", sucursalId);
      }
      
      // Si se proporciona una fecha, filtrar por ella
      if (fecha) {
        q = q.eq("fecha", fecha);
      }
      
      // Si se proporciona un barbero específico para filtrar, usarlo
      if (barberoId) {
        q = q.eq("id_barbero", barberoId);
      } 
      // Si el usuario no es administrador y no se especificó un barbero, solo mostrar sus propias citas
      else if (!isAdmin && barberoActual?.id_barbero) {
        q = q.eq("id_barbero", barberoActual.id_barbero);
      }
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        q = q.eq("id_barberia", idBarberia);
      }
      
      // Aplicar paginación
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      q = q.range(from, to);
      
      const { data, error, count } = await q.order("fecha", { ascending: true }).order("hora", { ascending: true });
      if (error) {
        throw error;
      }
      
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