"use client";

import { useState, useEffect } from "react";
import Head from 'next/head';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCitas } from "@/hooks/useCitas";
import { useBarberos } from "@/hooks/useBarberos";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { AppointmentModalWithSucursal } from "@/components/AppointmentModalWithSucursal";
import { AgendaBoard } from "@/components/AgendaBoard"; // Importar el nuevo componente
import type { Appointment, Barbero } from "@/types/db"; // Importar el tipo Barbero
import { toast } from "sonner";

export default function AgendaPage() {
  // Establecer el título de la página
  usePageTitle("Barberox | Agenda");
  
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const { sucursales } = useSucursales(idBarberia || undefined); // Obtener sucursales filtradas por idBarberia
  const [selectedSucursal, setSelectedSucursal] = useState<string | undefined>(undefined);
  const [isInitialSelectionDone, setIsInitialSelectionDone] = useState(false); // Bandera para controlar la preseleccion inicial
  const [modalSucursal, setModalSucursal] = useState<string | undefined>(undefined); // Sucursal para el modal
  
  // Preseleccionar la sucursal cuando se carguen las sucursales
  // Solo preseleccionar si no se ha hecho la selección inicial
  useEffect(() => {
    if (sucursales && sucursales.length > 0 && !isInitialSelectionDone) {
      // Para barberos normales, seleccionar automáticamente su sucursal
      if (!isAdmin && barbero?.id_sucursal) {
        setSelectedSucursal(barbero.id_sucursal);
      } else {
        // Para administradores, seleccionar la primera sucursal por defecto
        setSelectedSucursal(sucursales[0].id);
      }
      // Marcar que se ha hecho la selección inicial
      setIsInitialSelectionDone(true);
    }
  }, [sucursales, isInitialSelectionDone, isAdmin, barbero?.id_sucursal]);
  
  // Estado para controlar el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [selectedBarbero, setSelectedBarbero] = useState<string | undefined>(
    !isAdmin && barbero?.id_barbero ? barbero.id_barbero : undefined
  );
  
  // Para barberos no administradores, establecer automáticamente el barbero
  useEffect(() => {
    if (!isAdmin && barbero?.id_barbero && !selectedBarbero) {
      setSelectedBarbero(barbero.id_barbero);
    }
  }, [barbero, isAdmin, selectedBarbero]);
  
  // Obtener la lista de barberos filtrados por la sucursal seleccionada
  const barberosQuery = useBarberos(
    selectedSucursal ? selectedSucursal : undefined
  );
  const barberos = barberosQuery.data;
  const isLoadingBarberos = barberosQuery.isLoading;
  
  // Función para manejar la edición de turnos
  const handleEdit = (appointment: Appointment) => {
    console.log("Editar turno:", appointment);
    // Crear una copia del appointment sin los campos que pueden causar problemas
    const safeAppointment = { ...appointment };
    setSelectedAppointment(safeAppointment as Appointment);
    setIsEditModalOpen(true);
  };
  
  // Función para abrir el modal de creación
  const handleCreate = () => {
    console.log("=== HANDLE CREATE ===");
    console.log("selectedSucursal:", selectedSucursal);
    console.log("selectedBarbero:", selectedBarbero);
    console.log("barbero:", barbero);
    console.log("isAdmin:", isAdmin);
    
    // Establecer la sucursal para el modal
    setModalSucursal(selectedSucursal);
    
    // Crear un nuevo turno con valores predeterminados
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const newAppointment: Partial<Appointment> = {
      fecha: formattedDate,
      // Para barberos no administradores, usar el ID del barbero
      barbero: selectedBarbero || (!isAdmin && barbero?.id_barbero ? barbero.id_barbero : ""),
      // Inicializar hora vacía para nuevos turnos
      hora: "",
      // Inicializar servicio vacío para nuevos turnos
      servicio: ""
    };
    
    console.log("newAppointment:", newAppointment);
    setSelectedAppointment(newAppointment as Appointment);
    setIsCreateModalOpen(true);
    console.log("=== FIN HANDLE CREATE ===");
  };
  
  // Agregar logs de depuración
  console.log("Estado de los filtros:", {
    selectedSucursal,
    selectedBarbero,
    isAdmin,
    barberoActual: barbero
  });
  
  // Función para guardar los cambios en un turno
  const { updateMutation, createMutation } = useCitas(
    selectedSucursal ? selectedSucursal : (barbero?.id_sucursal || undefined),
    undefined,
    selectedBarbero ? selectedBarbero : (!isAdmin && barbero?.id_barbero ? barbero.id_barbero : undefined)
  );
  const handleSave = async (values: Partial<Appointment>) => {
    console.log("=== INICIO HANDLE SAVE ===");
    console.log("Valores recibidos:", values);
    
    if (selectedAppointment && selectedAppointment.id_cita) {
      // Actualizar turno existente
      try {
        console.log("Actualizando turno existente:", selectedAppointment.id_cita);
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
        console.log("Creando nuevo turno con valores:", values);
        // Filtrar valores para asegurarnos de no incluir campos undefined
        const filteredValues: any = {};
        Object.keys(values).forEach(key => {
          if (values[key as keyof typeof values] !== undefined) {
            filteredValues[key] = values[key as keyof typeof values];
          }
        });
        
        console.log("Valores filtrados:", filteredValues);
        await createMutation.mutateAsync(filteredValues);
        toast.success("Turno creado correctamente");
      } catch (error) {
        console.error("Error al crear el turno:", error);
        console.error("Tipo de error:", typeof error);
        console.error("Error detallado:", JSON.stringify(error, null, 2));
        if (error instanceof Error) {
          toast.error(`Error al crear el turno: ${error.message}`);
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          toast.error(`Error al crear el turno: ${(error as any).message}`);
        } else {
          toast.error("Error al crear el turno");
        }
      }
    }
    console.log("=== FIN HANDLE SAVE ===");
  };
  
  // Función para eliminar un turno
  const { deleteMutation } = useCitas(
    selectedSucursal ? selectedSucursal : (barbero?.id_sucursal || undefined),
    undefined,
    selectedBarbero ? selectedBarbero : (!isAdmin && barbero?.id_barbero ? barbero.id_barbero : undefined)
  );
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
        
        {/* Filtros por sucursal y barbero - solo mostrar para administradores */}
        {isAdmin && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sucursal-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1 md:text-sm">
                Filtrar por sucursal:
              </label>
              <select
                id="sucursal-filter"
                value={selectedSucursal || ""}
                onChange={(e) => {
                  setSelectedSucursal(e.target.value || undefined);
                  // Marcar que se ha hecho una selección intencional
                  setIsInitialSelectionDone(true);
                }}
                className="qoder-dark-input w-full py-2 px-3 text-sm md:py-3 md:px-4"
              >
                {sucursales && sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="barbero-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1 md:text-sm">
                Filtrar por barbero:
              </label>
              <select
                id="barbero-filter"
                value={selectedBarbero || ""}
                onChange={(e) => setSelectedBarbero(e.target.value || undefined)}
                className="qoder-dark-input w-full py-2 px-3 text-sm md:py-3 md:px-4"
                disabled={isLoadingBarberos}
              >
                <option value="">Todos los barberos</option>
                {barberos?.map((barberoItem: Barbero) => (
                  <option key={barberoItem.id_barbero} value={barberoItem.id_barbero}>
                    {barberoItem.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="flex-grow">
          <AgendaBoard 
            selectedSucursal={selectedSucursal}
            selectedBarbero={selectedBarbero}
            onEdit={handleEdit}
          />
        </div>
      </div>
      
      {/* Modal de edición de turno */}
      {selectedAppointment && selectedAppointment.id_cita && (
        <AppointmentModalWithSucursal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          initial={selectedAppointment}
          onSave={handleSave}
          sucursalId={selectedSucursal} // Pasar el ID de la sucursal seleccionada
        />
      )}
      
      {/* Modal de creación de turno */}
      {selectedAppointment && !selectedAppointment.id_cita && (
        <AppointmentModalWithSucursal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          initial={selectedAppointment}
          onSave={handleSave}
          sucursalId={selectedSucursal} // Pasar el ID de la sucursal seleccionada
        />
      )}
    </>
  );
}
