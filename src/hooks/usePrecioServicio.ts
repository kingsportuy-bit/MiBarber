import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function usePrecioServicio(nombreServicio: string) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["precioServicio", nombreServicio],
    queryFn: async () => {
      if (!nombreServicio) return 0;
      
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .select("precio")
        .ilike("nombre", nombreServicio)
        .single();
      
      if (error) {
        console.error("Error obteniendo precio del servicio:", error);
        return 0;
      }
      
      return data?.precio || 0;
    },
    enabled: !!nombreServicio,
  });
}