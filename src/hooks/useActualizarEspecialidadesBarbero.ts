import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Barbero } from "@/types/db";

export function useActualizarEspecialidadesBarbero() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id_barbero, 
      especialidades 
    }: { 
      id_barbero: string; 
      especialidades: string[]; 
    }) => {
      console.log("Actualizando especialidades del barbero:", { id_barbero, especialidades });
      
      const { data, error } = await (supabase as any)
        .from("mibarber_barberos")
        .update({ especialidades })
        .eq("id_barbero", id_barbero)
        .select()
        .single();
      
      if (error) {
        console.error("Error al actualizar especialidades del barbero:", error);
        throw error;
      }
      
      console.log("Especialidades actualizadas:", data);
      return data as Barbero;
    },
    onSuccess: () => {
      // Invalidar las consultas relacionadas con barberos para que se actualicen
      queryClient.invalidateQueries({ queryKey: ["barberos"] });
      queryClient.invalidateQueries({ queryKey: ["barberos-list"] });
      // Invalidar también las consultas de servicios para que se actualicen
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
}