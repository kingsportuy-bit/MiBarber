// Ejemplo de cómo reemplazar el modal en una página real
// Archivo: src/app/(main)/agenda/page.client.tsx

import { useState } from "react";
// ... otros imports ...

// ANTES - Modal antiguo que no se muestra correctamente
// import { SingleFormAppointmentModalWithSucursal } from "@/components/SingleFormAppointmentModalWithSucursal";

// DESPUÉS - Nuevo modal que se muestra correctamente
import { FinalAppointmentModal } from "@/components/FinalAppointmentModal";

export default function AgendaPageClient() {
  // ... otro código ...

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleOpenModal = (appointment?: any) => {
    setSelectedAppointment(appointment || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // ... otro código ...

  return (
    <div>
      {/* ... otro contenido ... */}
      
      {/* ANTES - Modal antiguo */}
      {/*
      <SingleFormAppointmentModalWithSucursal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        initial={selectedAppointment || undefined}
      />
      */}

      {/* DESPUÉS - Nuevo modal */}
      <FinalAppointmentModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        initial={selectedAppointment || undefined}
      />
    </div>
  );
}