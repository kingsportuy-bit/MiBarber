import React from 'react';
import { SimpleAppointmentModal } from './SimpleAppointmentModal';
import type { Appointment } from '@/types/db';

interface LegacyAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  onSave: (values: Partial<Appointment>) => Promise<void>;
}

/**
 * Componente de modal de citas para páginas antiguas
 * Utiliza los estilos V2 pero funciona independientemente del layout V2
 */
export function LegacyAppointmentModal({
  open,
  onOpenChange,
  initial,
  onSave
}: LegacyAppointmentModalProps) {
  return (
    <SimpleAppointmentModal
      open={open}
      onOpenChange={onOpenChange}
      initial={initial}
      onSave={onSave}
    />
  );
}