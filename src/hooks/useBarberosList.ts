import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Barbero } from "@/types/db";

export function useBarberosList(idBarberia?: string | null, idSucursal?: string | null) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["barberos-list", idBarberia, idSucursal],
    queryFn: async (): Promise<Barbero[]> => {
      let query = (supabase as any)
        .from("mibarber_barberos")
        .select("*")
        .eq("activo", true)
        .order("nombre", { ascending: true });
      
      // Si se proporciona un idBarberia, filtrar por él
      if (idBarberia) {
        console.log("useBarberosList - Filtrando por idBarberia:", idBarberia);
        query = query.eq("id_barberia", idBarberia);
      }
      
      // Si se proporciona un idSucursal, filtrar por él
      if (idSucursal) {
        console.log("useBarberosList - Filtrando por idSucursal:", idSucursal);
        query = query.eq("id_sucursal", idSucursal);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("❌ Error obteniendo lista de barberos:", error);
        throw error;
      }
      
      console.log("useBarberosList - Datos obtenidos:", data);
      
      return data as Barbero[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}