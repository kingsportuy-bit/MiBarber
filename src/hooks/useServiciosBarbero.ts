import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Service } from "@/types/db";

export function useServiciosBarbero(idBarbero: string | null) {
  const supabase = getSupabaseClient();

  const fetchServiciosBarbero = async (): Promise<Service[]> => {
    try {
      // Verificar que exista idBarbero antes de continuar
      if (!idBarbero) {
        console.warn("No idBarbero provided, returning empty services array");
        return [];
      }
      
      // Obtener el ID de sucursal del barbero actual
      const { data: barberoData, error: barberoError } = await (supabase as any)
        .from("mibarber_barberos")
        .select("id_sucursal")
        .eq("id_barbero", idBarbero)
        .single();
      
      if (barberoError) {
        console.error("Error fetching barbero data:", barberoError);
        return [];
      }
      
      // Si el barbero no tiene sucursal asignada, devolver array vacío
      if (!barberoData || !barberoData.id_sucursal) {
        console.warn("Barbero no tiene sucursal asignada");
        return [];
      }
      
      // Obtener servicios filtrados por la sucursal del barbero
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .select("*")
        .eq("id_sucursal", barberoData.id_sucursal)
        .eq("activo", true)
        .order("nombre", { ascending: true });
      
      if (error) {
        console.error("Error fetching servicios del barbero:", error);
        throw error;
      }
      
      return data as Service[];
    } catch (error) {
      console.error("Exception in fetchServiciosBarbero:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["serviciosBarbero", idBarbero],
    queryFn: fetchServiciosBarbero,
    enabled: !!idBarbero,
  });
}