// Hook para cancelar una cita (no DELETE físico, sino UPDATE a estado='cancelado')
// Sincronizado con WEB.md §3 — incluye sync de mibarber_clientes (stats, fase)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointmentRepository } from "@/lib/adapters/factory";

export interface DeleteCitaResult {
  mutate: (id_cita: string) => void;
  mutateAsync: (id_cita: string) => Promise<boolean>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useDeleteCita(): DeleteCitaResult {
  const queryClient = useQueryClient();
  const appointmentRepository = getAppointmentRepository();

  const mutation = useMutation({
    mutationFn: async (id_cita: string) => {
      // Delegar la cancelación lógica en el repositorio
      await appointmentRepository.delete(id_cita);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles-completo"] });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
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