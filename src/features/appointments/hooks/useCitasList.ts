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
      console.log('🔍 Parámetros de consulta de citas:', { sucursalId, fecha, barberoId, isAdmin, barberoActual: barberoActual?.id_barbero, idBarberia });
      
      let q = (supabase as any).from("mibarber_citas").select("*", { count: "exact" });
      
      // Si se proporciona una sucursal, filtrar por ella
      if (sucursalId) {
        console.log('🔍 Filtrando por sucursal:', sucursalId);
        q = q.eq("id_sucursal", sucursalId);
      }
      
      // Si se proporciona una fecha, filtrar por ella
      if (fecha) {
        console.log('🔍 Filtrando por fecha:', fecha);
        q = q.eq("fecha", fecha);
      }
      
      // Si se proporciona un barbero específico para filtrar (no cadena vacía), usarlo
      if (barberoId && barberoId !== "") {
        console.log('🔍 Filtrando por barbero ID:', barberoId);
        q = q.eq("id_barbero", barberoId);
      } 
      // Si no se especificó un barbero (barberoId es undefined o null), 
      // pero tenemos un barbero logueado, solo mostrar sus propias citas
      // Esto aplica tanto para administradores como para barberos normales
      else if (barberoActual?.id_barbero && (barberoId === undefined || barberoId === null)) {
        console.log('🔍 Filtrando por barbero actual:', barberoActual.id_barbero);
        q = q.eq("id_barbero", barberoActual.id_barbero);
      }
      // Si no hay usuario autenticado y no se especificó un barbero, no aplicar filtro de barbero
      else if (!barberoActual && (barberoId === undefined || barberoId === null)) {
        console.log('🔍 Sin usuario autenticado, mostrando todas las citas');
      }
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        console.log('🔍 Filtrando por barbería:', idBarberia);
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