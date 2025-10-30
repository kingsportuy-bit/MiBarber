"use client";

import { SingleFormAppointmentModal } from "@/features/appointments/components/AppointmentModal";

interface AppointmentModalWithSucursalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: any;
  onSave: (values: any) => Promise<void>;
  sucursalId?: string;
}

export function SingleFormAppointmentModalWithSucursal({
  open,
  onOpenChange,
  initial,
  onSave,
  sucursalId,
}: AppointmentModalWithSucursalProps) {
  return (
    <SingleFormAppointmentModal
      open={open}
      onOpenChange={onOpenChange}
      initial={initial}
      onSave={onSave}
      sucursalId={sucursalId}
    />
  );
}