// Hook para actualizar una cita existente y automáticamente establecer el estado a "modificado"
// Sincronizado con WEB.md — delegando el sync de mibarber_clientes al Repositorio central
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAppointmentRepository } from "@/lib/adapters/factory";
import type { Appointment } from '@/types/db';

export interface UpdateCitaModificadaResult {
  mutate: (updates: Partial<Appointment> & { id_cita: string }) => void;
  mutateAsync: (updates: Partial<Appointment> & { id_cita: string }) => Promise<Appointment>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useUpdateCitaModificada(): UpdateCitaModificadaResult {
  const appointmentRepository = getAppointmentRepository();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id_cita,
      ...updates
    }: Partial<Appointment> & { id_cita: string }) => {
      let estado = updates.estado;
      let estado_ciclo = "pendiente";
      
      // Lógica condicional para el estado y notificaciones
      if (updates.estado === "cancelado") {
        // ── Cancelar turno (WEB.md §3) ──
        estado = "cancelado";
        estado_ciclo = "cancelado";
      } else {
        // ── Modificar turno (WEB.md §2) ──
        estado = "modificado";
        estado_ciclo = "pendiente"; // Reset de ciclo operativo al reagendar
      }
      
      // Delegar la actualización en el repositorio central, que también se encargará de
      // la sincronización de las estadísticas y fases del cliente (syncClienteModificado / syncClienteCancelado)
      return appointmentRepository.update({
        id_cita,
        fecha: updates.fecha,
        hora: updates.hora,
        cliente_nombre: updates.cliente_nombre,
        servicio: updates.servicio,
        id_servicio: updates.id_servicio || undefined,
        barbero: updates.barbero,
        id_barbero: updates.id_barbero || undefined,
        estado: estado,
        estado_ciclo: estado_ciclo,
        notificacion_barbero: "no", // Siempre reiniciar la notificación del barbero para disparar trigger
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