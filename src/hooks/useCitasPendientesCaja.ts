import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from "@/types/db";

export function useCitasPendientesCaja() {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["citasPendientesCaja"],
    queryFn: async (): Promise<Appointment[]> => {
      // Obtener citas con estado "completado" y registrado_caja = "1"
      let q = (supabase as any)
        .from("mibarber_citas")
        .select("*")
        .eq("estado", "completado")
        .eq("registrado_caja", "1")
        .order("fecha")
        .order("hora");
      
      const { data, error } = await q;
      if (error) {
        console.error("❌ Error consultando citas pendientes de caja:", error);
        throw error;
      }
      
      // Obtener nombres de barberos por sus IDs
      const barberoIds = [...new Set(data.map((cita: any) => cita.barbero).filter(Boolean))];
      let barberoNames: Record<string, string> = {};
      
      if (barberoIds.length > 0) {
        // Convertir IDs numéricos a números si es necesario
        const numericIds = barberoIds.map((id: any) => {
          return isNaN(Number(id)) ? id : Number(id);
        }).filter((id: any) => typeof id === 'number');
        
        if (numericIds.length > 0) {
          const { data: barberosData, error: barberosError } = await (supabase as any)
            .from("mibarber_barberos")
            .select("id_barbero, nombre")
            .in("id_barbero", numericIds);
          
          if (!barberosError && barberosData) {
            barberoNames = Object.fromEntries(
              barberosData.map((b: any) => [b.id_barbero, b.nombre])
            );
          }
        }
      }
      
      // Agregar nombres de barberos a las citas
      const citasConNombres = data.map((cita: any) => ({
        ...cita,
        nombre_barbero: barberoNames[cita.barbero] || cita.barbero
      }));
      
      return citasConNombres as Appointment[];
    },
  });
}