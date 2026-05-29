// Hook para actualizar una cita existente (update genérico)
// Sincronizado con WEB.md v2 — incluye:
//   - notificacion_barbero='no' para triggers
//   - Sync mibarber_clientes al completar (Reglas 2, 3, 4)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Appointment } from '@/types/db';
import { getAppointmentRepository } from "@/lib/adapters/factory";

export interface UpdateCitaResult {
  mutate: (updates: Partial<Appointment> & { id_cita: string }) => void;
  mutateAsync: (updates: Partial<Appointment> & { id_cita: string }) => Promise<Appointment>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useUpdateCita(): UpdateCitaResult {
  const queryClient = useQueryClient();
  const appointmentRepository = getAppointmentRepository();

  const mutation = useMutation({
    mutationFn: async ({
      id_cita,
      ...updates
    }: Partial<Appointment> & { id_cita: string }) => {
      // Delegar la actualización en el repositorio
      return appointmentRepository.update({
        id_cita,
        fecha: updates.fecha,
        hora: updates.hora,
        cliente_nombre: updates.cliente_nombre,
        servicio: updates.servicio,
        id_servicio: updates.id_servicio || undefined,
        barbero: updates.barbero,
        id_barbero: updates.id_barbero || undefined,
        estado: updates.estado,
        nota: updates.nota,
        ticket: updates.ticket || undefined,
        nro_factura: updates.nro_factura || undefined,
        metodo_pago: updates.metodo_pago || undefined,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      queryClient.invalidateQueries({ queryKey: ["citas-rango"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles"] });
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