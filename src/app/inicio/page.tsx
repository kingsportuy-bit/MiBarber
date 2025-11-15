"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { KanbanBoard } from "@/components/KanbanBoard";
import { useState, useCallback } from "react";
import type { Appointment } from "@/types/db";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";
import { GlobalFilters } from "@/components/shared/GlobalFilters";

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
  
  return (
    // Contenedor principal para el tablero Kanban
    // Este contenedor será transparente y se adaptará al contenido
    <div 
      className="w-full flex flex-col flex-1"
      style={{ 
        backgroundColor: 'transparent'
      }}
    >
      {/* Título del tablero Kanban con filtros y botón de nuevo turno en la misma línea */}
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            Tablero de Turnos
          </h1>
          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* Filtros globales de sucursales y barberos con botón nuevo turno en la misma línea */}
            <div className="flex items-center gap-4">
              {/* Filtros con 10px más de ancho */}
              <div className="w-[566px]">
                <GlobalFilters 
                  showSucursalFilter={true}
                  showBarberoFilter={true}
                  showDateFilters={false}
                />
              </div>
              <button
                onClick={handleCreateNewAppointment}
                className="px-6 py-3 bg-qoder-dark-button-primary hover:bg-qoder-dark-button-hover text-qoder-dark-button-primary-text rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap text-lg font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nuevo Turno
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenedor del tablero Kanban */}
      <div className="w-full max-w-[1800px] mx-auto px-4 py-4 md:px-6 md:py-6 flex-1">
        <KanbanBoard 
          isCreateModalOpen={isCreateModalOpen} 
          setIsCreateModalOpen={setIsCreateModalOpen}
          selectedAppointment={selectedAppointment}
          setSelectedAppointment={setSelectedAppointment}
        />
      </div>
    </div>
  );
}