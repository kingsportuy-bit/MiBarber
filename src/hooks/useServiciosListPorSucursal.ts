import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Service } from "@/types/db";

export function useServiciosListPorSucursal(idSucursal?: string | null) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["servicios-list-por-sucursal", idSucursal],
    queryFn: async (): Promise<Service[]> => {
      console.log("useServiciosListPorSucursal - Iniciando consulta con idSucursal:", idSucursal);
      
      // Si no tenemos idSucursal, devolver array vacío
      if (!idSucursal) {
        console.log("useServiciosListPorSucursal - No hay idSucursal, devolviendo servicios vacíos");
        return [];
      }
      
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .select("*")
        .eq("activo", true)
        .eq("id_sucursal", idSucursal)
        .order("nombre", { ascending: true });
      
      if (error) {
        console.error("❌ Error obteniendo lista de servicios por sucursal:", error);
        throw error;
      }
      
      console.log("useServiciosListPorSucursal - Datos obtenidos:", data);
      
      return data as Service[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}