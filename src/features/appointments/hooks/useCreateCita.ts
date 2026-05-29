// Hook para crear una nueva cita
// Sincronizado con WEB.md — incluye sync de mibarber_clientes (fase, stats, contexto_turno_id)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Appointment } from '@/types/db';
import { getAppointmentRepository } from "@/lib/adapters/factory";

export interface CreateCitaResult {
  mutate: (newCita: Omit<Appointment, "id_cita">) => void;
  mutateAsync: (newCita: Omit<Appointment, "id_cita">) => Promise<Appointment>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useCreateCita(): CreateCitaResult {
  const queryClient = useQueryClient();
  const appointmentRepository = getAppointmentRepository();

  const mutation = useMutation({
    mutationFn: async (newCita: Omit<Appointment, "id_cita">) => {
      // Validar campos requeridos mínimos
      const requiredFields: (keyof Omit<Appointment, "id_cita" | "nota">)[] = [
        "fecha", 
        "hora", 
        "cliente_nombre", 
        "servicio", 
        "barbero",
        "telefono",
        "id_barbero",
        "id_sucursal",
        "id_barberia",
        "duracion"
      ];
      
      const missingFields = requiredFields.filter(field => {
        const value = newCita[field];
        return value === undefined || value === null || value === "";
      });
      
      if (missingFields.length > 0) {
        throw new Error(`Faltan campos requeridos para crear el turno: ${missingFields.join(", ")}`);
      }

      // Delegar la creación en el adaptador central
      return appointmentRepository.create({
        fecha: newCita.fecha,
        hora: newCita.hora,
        cliente_nombre: newCita.cliente_nombre,
        servicio: newCita.servicio,
        barbero: newCita.barbero,
        id_barbero: newCita.id_barbero || undefined,
        id_servicio: newCita.id_servicio || undefined,
        id_sucursal: newCita.id_sucursal || "",
        id_barberia: newCita.id_barberia || "",
        duracion: newCita.duracion,
        nota: newCita.nota || undefined,
        telefono: newCita.telefono || undefined,
        id_cliente: newCita.id_cliente || undefined
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles-completo"] });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: (error: Error) => {
      console.error('🔴 Error en mutation:', error.message);
    }
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