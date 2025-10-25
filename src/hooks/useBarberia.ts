"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function useBarberia(idBarberia: string | null) {
  const supabase = getSupabaseClient();

  const getBarberiaInfo = useQuery({
    queryKey: ["barberia", idBarberia],
    queryFn: async () => {
      if (!idBarberia) {
        return null;
      }
      
      const { data, error } = await (supabase as any)
        .from("mibarber_info")
        .select("*")
        .eq("id_barberia", idBarberia)
        .single();
      
      if (error) {
        console.error("Error obteniendo información de la barbería:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!idBarberia,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    barberia: getBarberiaInfo.data,
    isLoading: getBarberiaInfo.isLoading,
    isError: getBarberiaInfo.isError,
    error: getBarberiaInfo.error
  };
}