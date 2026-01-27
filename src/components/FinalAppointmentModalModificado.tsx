import React from 'react';
import { ProductionReadyModal } from './ProductionReadyModal';
import { useCreateCita } from '@/features/appointments/hooks/useCreateCita';
import { useUpdateCitaModificada } from '@/features/appointments/hooks/useUpdateCitaModificada';
import type { Appointment } from '@/types/db';
import { toast } from 'sonner';

interface FinalAppointmentModalModificadoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
}

/**
 * Modal para edición de turnos que automáticamente establece el estado a "modificado"
 * cuando se realizan cambios
 */
export function FinalAppointmentModalModificado({
  open,
  onOpenChange,
  initial
}: FinalAppointmentModalModificadoProps) {
  const createCita = useCreateCita();
  const updateCitaModificada = useUpdateCitaModificada();

  const handleSave = async (appointmentData: Partial<Appointment>) => {
    try {
      console.log('📥 Guardando turno (modo modificado):', appointmentData);
      
      if (initial?.id_cita) {
        // Actualizar turno existente - automáticamente se establece estado a "modificado"
        await updateCitaModificada.mutateAsync({
          ...appointmentData,
          id_cita: initial.id_cita
        } as Appointment);
        toast.success('Turno actualizado y notificación reiniciada');
      } else {
        // Crear nuevo turno (sin cambiar estado ya que es nuevo)
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
    <ProductionReadyModal
      open={open}
      onOpenChange={onOpenChange}
      initial={initial}
      onSave={handleSave}
    />
  );
}