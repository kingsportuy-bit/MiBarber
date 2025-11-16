"use client";

import { SingleFormAppointmentModal } from "@/features/appointments/components/AppointmentModal";
import { useCreateCita } from "@/features/appointments/hooks/useCreateCita";  // ✅ Ruta correcta
import { useUpdateCita } from "@/features/appointments/hooks/useUpdateCita";  // ✅ Ruta correcta
import type { Appointment } from "@/types/db";
import { toast } from "sonner";

interface AppointmentModalWithSucursalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: any;
  sucursalId?: string;
}

export function SingleFormAppointmentModalWithSucursal({
  open,
  onOpenChange,
  initial,
  sucursalId,
}: AppointmentModalWithSucursalProps) {
  const createCita = useCreateCita();
  const updateCita = useUpdateCita();

  const handleSave = async (appointmentData: Partial<Appointment>) => {
    try {
      console.log('📥 Guardando turno:', appointmentData);
      
      if (initial?.id_cita) {
        // Actualizar turno existente
        await updateCita.mutateAsync({
          ...appointmentData,
          id_cita: initial.id_cita
        } as Appointment);
        toast.success('Turno actualizado correctamente');
      } else {
        // Crear nuevo turno
        await createCita.mutateAsync(appointmentData as Omit<Appointment, 'id_cita'>);
        toast.success('Turno creado correctamente');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar turno:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Error al guardar el turno');
      }
    }
  };

  return (
    <SingleFormAppointmentModal
      open={open}
      onOpenChange={onOpenChange}
      initial={initial}
      onSave={handleSave}
      sucursalId={sucursalId}
    />
  );
}
