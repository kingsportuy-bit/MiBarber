"use client";

import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { WindowLayout } from "@/components/WindowLayout";
import { KanbanBoardDndKit } from "@/components/KanbanBoardDndKit";
import { AppointmentModal } from "@/components/AppointmentModal";
import { useBarberos } from "@/hooks/useBarberos";
import { useSucursales } from "@/hooks/useSucursales";
import type { Appointment, Sucursal } from "@/types/db";
import { useCitas } from "@/hooks/useCitas";
import { getLocalDateString } from "@/utils/dateUtils"; // Importar la utilidad de fecha
import { CustomDatePicker } from "@/components/CustomDatePicker"; // Agregar esta importación

export default function ProtectedPage() {
  usePageTitle("Barberox | Dashboard");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  // Usar la utilidad de fecha corregida
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [selectedSucursal, setSelectedSucursal] = useState<string | undefined>(undefined);
  const [selectedBarbero, setSelectedBarbero] = useState<string | undefined>(undefined);
  
  const { refetch } = useCitas();
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberos(selectedSucursal);
  const { sucursales, isLoading: isLoadingSucursales } = useSucursales();

  // Cuando se selecciona una sucursal, resetear el barbero seleccionado
  useEffect(() => {
    setSelectedBarbero(undefined);
  }, [selectedSucursal]);

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
          
          <div className="flex items-center gap-2">
            <label className="text-qoder-dark-text-primary">Sucursal:</label>
            <select
              value={selectedSucursal || ""}
              onChange={(e) => setSelectedSucursal(e.target.value || undefined)}
              className="qoder-dark-select px-3 py-1 rounded-lg"
              disabled={isLoadingSucursales}
            >
              <option value="">Todas</option>
              {isLoadingSucursales ? (
                <option disabled>Cargando...</option>
              ) : (
                sucursales?.map((sucursal: Sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-qoder-dark-text-primary">Barbero:</label>
            <select
              value={selectedBarbero || ""}
              onChange={(e) => setSelectedBarbero(e.target.value || undefined)}
              className="qoder-dark-select px-3 py-1 rounded-lg"
              disabled={isLoadingBarberos}
            >
              <option value="">Todos</option>
              {isLoadingBarberos ? (
                <option disabled>Cargando...</option>
              ) : (
                barberos?.map((barbero) => (
                  <option key={barbero.id_barbero} value={barbero.id_barbero}>
                    {barbero.nombre}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>
      
      <KanbanBoardDndKit 
        onEdit={handleEdit} 
        filters={{
          sucursalId: selectedSucursal,
          barberoId: selectedBarbero,
          fecha: selectedDate
        }}
      />
      
      <AppointmentModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        initial={selectedAppointment || undefined}
        onSave={handleSave}
      />
    </div>
  );
}
