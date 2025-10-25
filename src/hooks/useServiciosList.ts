import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Service } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export function useServiciosList(idBarberia?: string | null) {
  const supabase = getSupabaseClient();
  const { idBarberia: authIdBarberia } = useBarberoAuth();
  
  // Usar el idBarberia proporcionado o el de la autenticación
  const barberiaId = idBarberia || authIdBarberia;

  return useQuery({
    queryKey: ["servicios-list", barberiaId],
    queryFn: async (): Promise<Service[]> => {
      console.log("useServiciosList - Iniciando consulta con idBarberia:", barberiaId);
      
      // Si no tenemos idBarberia, devolver array vacío
      if (!barberiaId) {
        console.log("useServiciosList - No hay idBarberia, devolviendo servicios vacíos");
        return [];
      }
      
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .select("*")
        .eq("activo", true)
        .eq("id_barberia", barberiaId)
        .order("nombre", { ascending: true });
      
      if (error) {
        console.error("❌ Error obteniendo lista de servicios:", error);
        throw error;
      }
      
      console.log("useServiciosList - Datos obtenidos:", data);
      
      return data as Service[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}