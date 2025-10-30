"use client";

import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { WindowLayout } from "@/components/WindowLayout";
import { KanbanBoardDndKit } from "@/components/KanbanBoardDndKit";
import { AppointmentModalWithSucursal } from "@/components/AppointmentModalWithSucursal";
import { useBarberos } from "@/hooks/useBarberos";
import { useSucursales } from "@/hooks/useSucursales";
import type { Appointment, Sucursal } from "@/types/db";
import { useCitas } from "@/hooks/useCitas";
import { getLocalDateString } from "@/utils/dateUtils"; // Importar la utilidad de fecha
import { CustomDatePicker } from "@/components/CustomDatePicker"; // Agregar esta importación
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { GlobalFilters } from "@/components/shared/GlobalFilters";

export default function ProtectedPage() {
  usePageTitle("Barberox | Dashboard");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  // Usar la utilidad de fecha corregida
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const { filters, isAdmin } = useGlobalFilters();
  
  const { refetch } = useCitas();
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberos(filters.sucursalId || undefined);
  const { sucursales, isLoading: isLoadingSucursales } = useSucursales();

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleSave = async (values: Partial<Appointment>) => {
    // Aquí iría la lógica para guardar la cita
    // Por ahora solo cerramos el modal y refrescamos
    await refetch();
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    // Usar la utilidad de fecha corregida
    setSelectedDate(getLocalDateString(newDate));
  };

  const handleToday = () => {
    // Usar la utilidad de fecha corregida
    setSelectedDate(getLocalDateString());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filtros globales - solo visibles para administradores */}
      {isAdmin && <GlobalFilters className="mb-4" />}
      
      <div className="qoder-dark-card p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleDateChange(-1)}
              className="qoder-dark-button px-3 py-1 rounded-lg hover-lift smooth-transition"
            >
              ← Anterior
            </button>
            <CustomDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Seleccionar fecha"
            />
            <button 
              onClick={() => handleDateChange(1)}
              className="qoder-dark-button px-3 py-1 rounded-lg hover-lift smooth-transition"
            >
              Siguiente →
            </button>
            <button 
              onClick={handleToday}
              className="qoder-dark-button-primary px-3 py-1 rounded-lg hover-lift smooth-transition"
            >
              Hoy
            </button>
          </div>
        </div>
      </div>
      
      <KanbanBoardDndKit 
        onEdit={handleEdit} 
        filters={{
          sucursalId: filters.sucursalId || undefined,
          barberoId: filters.barberoId || undefined,
          fecha: selectedDate
        }}
      />
      
      <AppointmentModalWithSucursal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        initial={selectedAppointment || undefined}
        onSave={handleSave}
      />
    </div>
  );
}