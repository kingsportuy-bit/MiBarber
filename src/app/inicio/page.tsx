"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { KanbanBoard } from "@/components/KanbanBoard";
import { MobileAppointmentList } from "@/components/MobileAppointmentList";
import { useState, useCallback, useEffect } from "react";
import type { Appointment } from "@/types/db";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";
import { GlobalFilters } from "@/components/shared/GlobalFilters";
import { FinalAppointmentModal } from "@/components/FinalAppointmentModal";

export default function DashboardPage() {
  usePageTitle("Barberox | Inicio");
  
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
    // Contenedor principal para el tablero Kanban
    // Este contenedor será transparente y se adaptará al contenido
    <div 
      className="w-full flex flex-col flex-1 relative"
      style={{ 
        backgroundColor: 'transparent'
      }}
    >
      {/* Contenedor del tablero Kanban sin paddings innecesarios */}
      <div className="w-full max-w-[1800px] mx-auto flex-1">
        <div className="h-full w-full overflow-x-auto md:overflow-x-visible">
          {/* Vista de escritorio - Tablero Kanban */}
          <div className="hidden md:block">
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
        </div>
      </div>
      
      {/* Modal de cita - Compartido entre vistas móvil y escritorio */}
      <FinalAppointmentModal
        open={isCreateModalOpen}
        onOpenChange={handleCloseModal}
        initial={selectedAppointment || undefined}
      />
    </div>
  );
}