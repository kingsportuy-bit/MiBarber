"use client";

import { useState, useEffect } from "react";
import Head from 'next/head';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { SingleFormAppointmentModalWithSucursal } from "@/components/SingleFormAppointmentModalWithSucursal";
import { CalendarWithBloqueos } from "@/components/CalendarWithBloqueos"; // Importar CalendarWithBloqueos
import { GlobalFilters } from "@/components/shared/GlobalFilters"; // Importar GlobalFilters
import type { Appointment } from "@/types/db"; // Importar el tipo Barbero
import { toast } from "sonner";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";

export default function AgendaPage() {
  // Establecer el título de la página
  usePageTitle("Barberox | Agenda");
  
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const { filters } = useGlobalFilters();
  
  console.log('📅 AgendaPage - Datos de autenticación:', { idBarberia, barbero: barbero?.id_barbero, isAdmin });
  console.log('📅 AgendaPage - Filtros globales:', filters);
  
  // Estado para controlar el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalSucursal, setModalSucursal] = useState<string | undefined>(undefined); // Sucursal para el modal
  
  // Función para manejar la edición de turnos
  const handleEdit = (appointment: Appointment) => {
    // Crear una copia del appointment sin los campos que pueden causar problemas
    const safeAppointment = { ...appointment };
    setSelectedAppointment(safeAppointment as Appointment);
    setIsEditModalOpen(true);
  };
  
  // Verificar si una hora está bloqueada
  const isTimeBlocked = (fecha: string, hora: string, sucursalId?: string, barberoId?: string) => {
    // En una implementación completa, aquí se verificaría contra los bloqueos
    // Por ahora, retornamos false para no bloquear la creación
    return false;
  };
  
  // Función para abrir el modal de creación
  const handleCreate = () => {
    // Establecer la sucursal para el modal
    setModalSucursal(filters.sucursalId || undefined);
    
    // Crear un nuevo turno con valores predeterminados
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const newAppointment: Partial<Appointment> = {
      fecha: formattedDate,
      // Para barberos no administradores, usar el ID del barbero
      barbero: filters.barberoId || (!isAdmin && barbero?.id_barbero ? barbero.id_barbero : ""),
      // Inicializar hora vacía para nuevos turnos
      hora: "",
      // Inicializar servicio vacío para nuevos turnos
      servicio: ""
    };
    
    setSelectedAppointment(newAppointment as Appointment);
    setIsCreateModalOpen(true);
  };
  
  // Función para guardar los cambios en un turno
  const { updateMutation, createMutation } = useCitas({
    sucursalId: filters.sucursalId || (barbero?.id_sucursal || undefined),
    barberoId: filters.barberoId || (!isAdmin && barbero?.id_barbero ? barbero.id_barbero : undefined)
  });
  
  const handleSave = async (values: Partial<Appointment>) => {
    if (selectedAppointment && selectedAppointment.id_cita) {
      // Actualizar turno existente
      try {
        await updateMutation.mutateAsync({
          id_cita: selectedAppointment.id_cita,
          ...values
        });
        toast.success("Turno actualizado correctamente");
      } catch (error) {
        console.error("Error al actualizar el turno:", error);
        console.error("Tipo de error:", typeof error);
        if (error instanceof Error) {
          toast.error(`Error al actualizar el turno: ${error.message}`);
        } else {
          toast.error("Error al actualizar el turno");
        }
      }
    } else {
      // Crear nuevo turno
      try {
        // Verificar si la hora está bloqueada
        if (values.fecha && values.hora && isTimeBlocked(values.fecha, values.hora, filters.sucursalId || undefined, filters.barberoId || undefined)) {
          toast.error("No se puede crear un turno en un horario bloqueado");
          return;
        }
        
        // Asegurarse de que los campos requeridos estén presentes
        const appointmentToCreate: Omit<Appointment, "id_cita"> = {
          fecha: values.fecha || "",
          hora: values.hora || "",
          cliente_nombre: values.cliente_nombre || "",
          servicio: values.servicio || "",
          estado: values.estado || "pendiente",
          nota: values.nota || null,
          creado: values.creado || new Date().toISOString(),
          id_cliente: values.id_cliente || null,
          duracion: values.duracion || "30m",
          notificacion_barbero: values.notificacion_barbero || null,
          notificacion_cliente: values.notificacion_cliente || null,
          ticket: values.ticket || null,
          nro_factura: values.nro_factura || null,
          barbero: values.barbero || (!isAdmin && barbero?.id_barbero ? barbero.id_barbero : ""),
          metodo_pago: values.metodo_pago || null,
          id_barberia: values.id_barberia || null,
          id_sucursal: values.id_sucursal || filters.sucursalId || barbero?.id_sucursal || "",
          id_barbero: values.id_barbero || filters.barberoId || (!isAdmin && barbero?.id_barbero ? barbero.id_barbero : null),
          created_at: values.created_at || new Date().toISOString(),
          updated_at: values.updated_at || new Date().toISOString()
        };
        
        await createMutation.mutateAsync(appointmentToCreate);
        toast.success("Turno creado correctamente");
      } catch (error) {
        console.error("Error al crear el turno:", error);
        console.error("Tipo de error:", typeof error);
        console.error("Error detallado:", JSON.stringify(error, null, 2));
        if (error instanceof Error) {
          toast.error(`Error al crear el turno: ${error.message}`);
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          toast.error(`Error al crear el turno: ${(error as { message: string }).message}`);
        } else {
          toast.error("Error al crear el turno");
        }
      }
    }
  };
  
  // Función para eliminar un turno
  const { deleteMutation } = useCitas({
    sucursalId: filters.sucursalId || (barbero?.id_sucursal || undefined),
    barberoId: filters.barberoId || (!isAdmin && barbero?.id_barbero ? barbero.id_barbero : undefined)
  });
  
  const handleDelete = async () => {
    if (!selectedAppointment || !selectedAppointment.id_cita) return;
    
    try {
      await deleteMutation.mutateAsync(selectedAppointment.id_cita);
      toast.success("Turno eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el turno:", error);
      toast.error("Error al eliminar el turno");
    }
  };

  return (
    <>
      <Head>
        <title>Barberox | Agenda</title>
      </Head>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary md:text-2xl">Calendario de Turnos</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleCreate}
              className="qoder-dark-button-primary px-3 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition text-sm md:px-4 md:py-3 md:text-base"
            >
              <span>+</span>
              <span className="hidden sm:inline">Agregar Turno</span>
            </button>
          </div>
        </div>
        
        {/* Agregar filtros globales */}
        <GlobalFilters showDateFilters={false} />
        
        <div className="flex-grow mt-4">
          <CalendarWithBloqueos 
            sucursalId={filters.sucursalId || undefined}
            barbero={filters.barberoId || undefined}
            onEdit={handleEdit}
            initialView="timeGridDay" // Establecer vista de día por defecto
          />
        </div>
      </div>
      
      {/* Modal de edición de turno */}
      {selectedAppointment && selectedAppointment.id_cita && (
        <SingleFormAppointmentModalWithSucursal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          initial={selectedAppointment}
          onSave={handleSave}
          sucursalId={filters.sucursalId || undefined} // Pasar el ID de la sucursal seleccionada
        />
      )}
      
      {/* Modal de creación de turno */}
      {selectedAppointment && !selectedAppointment.id_cita && (
        <SingleFormAppointmentModalWithSucursal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          initial={selectedAppointment}
          onSave={handleSave}
          sucursalId={filters.sucursalId || undefined} // Pasar el ID de la sucursal seleccionada
        />
      )}
    </>
  );
}
