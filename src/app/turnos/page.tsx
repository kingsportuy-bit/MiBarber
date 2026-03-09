"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { KanbanBoard } from "@/components/KanbanBoard";
import { MobileAppointmentList } from "@/components/MobileAppointmentList";
import { useState, useCallback, useEffect } from "react";
import type { Appointment } from "@/types/db";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";
import { GlobalFilters } from "@/components/shared/GlobalFilters";
import { FinalAppointmentModalModificado } from "@/components/FinalAppointmentModalModificado";
import { WhatsAppNotification } from "@/components/WhatsAppNotification";

export default function DashboardPage() {
  usePageTitle("Barberox | Agenda");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Partial<Appointment> | null>(null);

  const handleCreateNewAppointment = useCallback(() => {
    // Crear una nueva cita con la fecha actual
    const currentDate = getLocalDateTime();
    const newAppointment: Partial<Appointment> = {
      fecha: getLocalDateString(currentDate),
      hora: "",
      servicio: "",
      barbero: ""
    };

    setSelectedAppointment(newAppointment);
    setIsCreateModalOpen(true);
  }, []);

  // Efecto para escuchar el evento personalizado
  useEffect(() => {
    const handleOpenModal = () => {
      console.log('Recibiendo evento openNewAppointmentModal');
      // Crear una nueva cita con la fecha actual
      const currentDate = getLocalDateTime();
      const newAppointment: Partial<Appointment> = {
        fecha: getLocalDateString(currentDate),
        hora: "",
        servicio: "",
        barbero: ""
      };

      setSelectedAppointment(newAppointment);
      setIsCreateModalOpen(true);
    };

    window.addEventListener('openNewAppointmentModal', handleOpenModal);

    return () => {
      window.removeEventListener('openNewAppointmentModal', handleOpenModal);
    };
  }, []);

  const handleEditAppointment = (cita: Appointment) => {
    setSelectedAppointment(cita);
    setIsCreateModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div style={{ padding: "0 20px 24px", width: "100%", margin: "0 auto" }}>

      {/* Vista de escritorio - Tablero Kanban */}
      <div className="hidden md:block" style={{ overflow: "auto" }}>
        <KanbanBoard
          isCreateModalOpen={isCreateModalOpen}
          setIsCreateModalOpen={setIsCreateModalOpen}
          selectedAppointment={selectedAppointment}
          setSelectedAppointment={setSelectedAppointment}
        />
      </div>

      {/* Vista móvil - Lista de citas */}
      <div className="md:hidden">
        <MobileAppointmentList onEdit={handleEditAppointment} />
      </div>

      {/* Modal de cita */}
      <FinalAppointmentModalModificado
        open={isCreateModalOpen}
        onOpenChange={handleCloseModal}
        initial={selectedAppointment || undefined}
      />
      <WhatsAppNotification />
    </div>
  );
}