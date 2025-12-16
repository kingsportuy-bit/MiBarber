import React from 'react';
import { EnhancedAppointmentModal } from './EnhancedAppointmentModal';
import { useCreateCita } from '@/features/appointments/hooks/useCreateCita';
import { useUpdateCita } from '@/features/appointments/hooks/useUpdateCita';
import type { Appointment } from '@/types/db';
import { toast } from 'sonner';

interface EnhancedFinalAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  sucursalId?: string;
}

/**
 * Modal final mejorado listo para usar en producción
 * Incluye toda la lógica de guardado y la funcionalidad de cliente rápido
 */
export function EnhancedFinalAppointmentModal({
  open,
  onOpenChange,
  initial,
  sucursalId
}: EnhancedFinalAppointmentModalProps) {
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
      throw error;
    }
  };

  return (
    <EnhancedAppointmentModal
      open={open}
      onOpenChange={onOpenChange}
      initial={initial}
      onSave={handleSave}
      sucursalId={sucursalId}
    />
  );
}