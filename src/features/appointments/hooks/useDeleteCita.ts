// Hook para eliminar una cita
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";

export interface DeleteCitaResult {
  mutate: (id_cita: string) => void;
  mutateAsync: (id_cita: string) => Promise<boolean>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useDeleteCita(): DeleteCitaResult {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id_cita: string) => {
      const { error } = await (supabase as any)
        .from("mibarber_citas")
        .delete()
        .eq("id_cita", id_cita);
      
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      // Invalidar todas las consultas de citas
      queryClient.invalidateQueries({ queryKey: ["citas"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error || null,
    isSuccess: mutation.isSuccess,
  };
}