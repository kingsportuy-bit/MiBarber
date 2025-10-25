"use client";

import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { WindowLayout } from "@/components/WindowLayout";
import { ProtectedDashboard } from "@/components/ProtectedDashboard";
import { AppointmentModalWithSucursal } from "@/components/AppointmentModalWithSucursal";
import { useCitas } from "@/hooks/useCitas";
import type { Appointment } from "@/types/db";

export default function DashboardPage() {
  usePageTitle("MiBarber | Dashboard");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { updateMutation, createMutation, refetch } = useCitas();

  const handleEdit = (appointment: Appointment) => {
    console.log("Editar turno:", appointment);
    console.log("handleEdit llamado con appointment:", appointment);
    const safeAppointment = { ...appointment };
    console.log("safeAppointment creado:", safeAppointment);
    setSelectedAppointment(safeAppointment as Appointment);
    console.log("setSelectedAppointment llamado, abriendo modal");
    setIsEditModalOpen(true);
  };
  
  const handleCreate = () => {
    console.log("Crear nuevo turno");
    const today = new Date().toISOString().split('T')[0];
    
    const newAppointment: Partial<Appointment> = {
      fecha: today,
      hora: "",
      servicio: "",
      barbero: ""
    };
    
    console.log("newAppointment:", newAppointment);
    setSelectedAppointment(newAppointment as Appointment);
    setIsCreateModalOpen(true);
  };

  const handleSave = async (values: Partial<Appointment>) => {
    if (!selectedAppointment) return;
    
    try {
      console.log("Guardando cambios:", values);
      
      if (selectedAppointment.id_cita) {
        await updateMutation.mutateAsync({
          id_cita: selectedAppointment.id_cita,
          ...values
        });
      } else {
        const filteredValues: any = {};
        Object.keys(values).forEach(key => {
          if (values[key as keyof typeof values] !== undefined) {
            filteredValues[key] = values[key as keyof typeof values];
          }
        });
        
        console.log("Valores filtrados para crear:", filteredValues);
        await createMutation.mutateAsync(filteredValues);
      }
      
      console.log("Cita guardada exitosamente");
      refetch();
      if (selectedAppointment.id_cita) {
        setIsEditModalOpen(false);
      } else {
        setIsCreateModalOpen(false);
      }
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error("Error al guardar la cita:", error);
      let errorMessage = "Error al guardar la cita. Por favor, inténtelo de nuevo.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error.message || errorMessage;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ProtectedDashboard onEdit={handleEdit} onCreate={handleCreate} />
      
      {selectedAppointment && selectedAppointment.id_cita && (
        <AppointmentModalWithSucursal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          initial={selectedAppointment}
          onSave={handleSave}
          sucursalId={selectedAppointment.id_sucursal || undefined}
        />
      )}
      
      {selectedAppointment && !selectedAppointment.id_cita && (
        <AppointmentModalWithSucursal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          initial={selectedAppointment}
          onSave={handleSave}
          sucursalId={undefined}
        />
      )}
    </div>
  );
}
