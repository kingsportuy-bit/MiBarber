"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "@/components/KanbanColumn";
import { FinalAppointmentModal } from "@/components/FinalAppointmentModal";
import type { Appointment } from "@/types/db";
import { useCitas } from "@/hooks/useCitas";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useUpdateCita } from "@/features/appointments/hooks/useUpdateCita";
import { toast } from "sonner";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";

// Definir tipos para las columnas del tablero Kanban
type ColumnId = "pendientes" | "completadas" | "canceladas";
type EstadoCita = "pendiente" | "confirmado" | "completado" | "cancelado";

interface Column {
  id: ColumnId;
  title: string;
  color: string;
  taskIds: string[];
}

// Tipo de tarea compatible con TaskCard
interface Task {
  id: string;
  content: string;
  cita?: Appointment;
}

interface KanbanTask extends Appointment {
  id: string;
  columnId: ColumnId;
}

// Props para el componente KanbanBoard
interface KanbanBoardProps {
  isCreateModalOpen?: boolean;
  setIsCreateModalOpen?: (open: boolean) => void;
  selectedAppointment?: Partial<Appointment> | null;
  setSelectedAppointment?: (appointment: Partial<Appointment> | null) => void;
}

// Definir las columnas del tablero
const COLUMNS: Record<ColumnId, Column> = {
  pendientes: {
    id: "pendientes",
    title: "Pendientes",
    color: "orange",
    taskIds: [],
  },
  completadas: {
    id: "completadas",
    title: "Completadas",
    color: "green",
    taskIds: [],
  },
  canceladas: {
    id: "canceladas",
    title: "Canceladas",
    color: "gray",
    taskIds: [],
  },
};

export function KanbanBoard({ 
  isCreateModalOpen, 
  setIsCreateModalOpen,
  selectedAppointment,
  setSelectedAppointment
}: KanbanBoardProps) {
  console.log('KanbanBoard props:', { isCreateModalOpen, selectedAppointment });
  const { filters } = useGlobalFilters();
  const { barbero: barberoActual, isAdmin } = useBarberoAuth();
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Usar la fecha ajustada a la zona horaria local
    const localDate = getLocalDateTime();
    return localDate;
  });
  
  // Estados locales para el modal si no se pasan como props
  const [localIsCreateModalOpen, localSetIsCreateModalOpen] = useState(false);
  const [localSelectedAppointment, localSetSelectedAppointment] = useState<Partial<Appointment> | null>(null);
  
  // Usar props si se pasan, de lo contrario usar estados locales
  const modalOpen = isCreateModalOpen !== undefined ? isCreateModalOpen : localIsCreateModalOpen;
  const setModalOpen = setIsCreateModalOpen !== undefined ? setIsCreateModalOpen : localSetIsCreateModalOpen;
  const appointment = selectedAppointment !== undefined ? selectedAppointment : localSelectedAppointment;
  const setAppointment = setSelectedAppointment !== undefined ? setSelectedAppointment : localSetSelectedAppointment;
  
  // Estado para las columnas
  const [columns, setColumns] = useState<Record<ColumnId, Column>>(() => COLUMNS);
  
  // Obtener citas para la fecha actual
  // Para la página de inicio, siempre mostrar las citas del barbero logueado
  const { data: citas = [], isLoading, isError, refetch } = useCitas({
    sucursalId: barberoActual?.id_sucursal || undefined,
    fecha: getLocalDateString(currentDate), // Usar nuestra función unificada
    barberoId: barberoActual?.id_barbero || undefined,
  });
  
  // Hook para crear citas
  const { createMutation } = useCitas({
    sucursalId: barberoActual?.id_sucursal || undefined,
    barberoId: barberoActual?.id_barbero || undefined
  });
  
  const { mutateAsync: updateCita } = useUpdateCita();
  
  // Convertir citas a tareas para el tablero Kanban
  const kanbanTasks = useMemo(() => {
    const taskMap: Record<string, KanbanTask> = {};
    
    citas.forEach(cita => {
      // Mapear el estado de la cita a una columna del tablero
      let columnId: ColumnId = "pendientes";
      if (cita.estado === "completado") {
        columnId = "completadas";
      } else if (cita.estado === "cancelado") {
        columnId = "canceladas";
      }
      
      taskMap[cita.id_cita] = {
        ...cita,
        id: cita.id_cita,
        columnId,
      };
    });
    
    return taskMap;
  }, [citas]);
  
  // Ref para rastrear las tareas anteriores y evitar actualizaciones innecesarias
  const prevKanbanTasksRef = useRef<Record<string, any>>({});

  // Actualizar columnas cuando cambian las tareas
  useEffect(() => {
    // Verificar si las tareas realmente cambiaron
    const prevTasks = prevKanbanTasksRef.current;
    const currentTasks = kanbanTasks;
    
    // Comparar las tareas para ver si realmente cambiaron
    const hasChanged = Object.keys(currentTasks).length !== Object.keys(prevTasks).length ||
      Object.keys(currentTasks).some(key => 
        currentTasks[key].id !== prevTasks[key]?.id ||
        currentTasks[key].columnId !== prevTasks[key]?.columnId
      );
    
    if (hasChanged) {
      setColumns(prevColumns => {
        const columnTasks: Record<ColumnId, string[]> = {
          pendientes: [],
          completadas: [],
          canceladas: [],
        };

        Object.values(kanbanTasks).forEach(task => {
          columnTasks[task.columnId].push(task.id);
        });

        const updatedColumns: Record<ColumnId, Column> = {
          pendientes: {
            ...COLUMNS.pendientes,
            taskIds: columnTasks.pendientes,
          },
          completadas: {
            ...COLUMNS.completadas,
            taskIds: columnTasks.completadas,
          },
          canceladas: {
            ...COLUMNS.canceladas,
            taskIds: columnTasks.canceladas,
          },
        };

        // Verificar si las columnas realmente cambiaron para evitar actualizaciones innecesarias
        const columnsChanged = (Object.keys(updatedColumns) as ColumnId[]).some(
          columnId => 
            JSON.stringify(updatedColumns[columnId].taskIds) !== JSON.stringify(prevColumns[columnId].taskIds)
        );

        if (columnsChanged) {
          return updatedColumns;
        }
        
        return prevColumns;
      });
    }
    
    // Actualizar las tareas anteriores
    prevKanbanTasksRef.current = kanbanTasks;
  }, [kanbanTasks]);
  
  // Convertir tareas de Kanban a tareas compatibles con TaskCard
  const convertToTaskCardFormat = (kanbanTask: KanbanTask): Task => {
    return {
      id: kanbanTask.id,
      content: `${kanbanTask.cliente_nombre || 'Cliente'} - ${kanbanTask.servicio || 'Servicio'} (${kanbanTask.hora?.slice(0, 5) || 'Sin hora'})`,
      cita: kanbanTask // Pasar los datos completos de la cita
    };
  };
  
  // Handlers de navegación - usando la misma forma que la agenda
  const goToPreviousDay = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);
  
  const goToNextDay = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, []);
  
  const goToToday = useCallback(() => {
    setCurrentDate(getLocalDateTime());
  }, []);
  
  // Manejar cambio de fecha desde el componente de navegación
  const handleDateChange = (date: string) => {
    // Convertir string a Date
    const [year, month, day] = date.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    setCurrentDate(newDate);
  };
  
  const handleCreateNewAppointment = () => {
    const newAppointment: Partial<Appointment> = {
      fecha: getLocalDateString(currentDate),
      hora: "",
      servicio: "",
      barbero: ""
    };
    
    setAppointment(newAppointment);
    setModalOpen(true);
  };
  
  const handleSaveAppointment = async (values: Partial<Appointment>) => {
    try {
      // Verificar si es una actualización o creación
      if (values.id_cita) {
        // Actualizar turno existente
        await updateCita({
          id_cita: values.id_cita,
          ...values
        });
        toast.success("Turno actualizado correctamente");
      } else {
        // Crear nuevo turno
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
          barbero: values.barbero || "",
          metodo_pago: values.metodo_pago || null,
          id_barberia: values.id_barberia || null,
          id_sucursal: values.id_sucursal || filters.sucursalId || "",
          id_barbero: values.id_barbero || filters.barberoId || null,
          created_at: values.created_at || new Date().toISOString(),
          updated_at: values.updated_at || new Date().toISOString()
        };
        
        await createMutation.mutateAsync(appointmentToCreate);
        toast.success("Turno creado correctamente");
      }
      
      // Cerrar el modal y limpiar la cita seleccionada
      setModalOpen(false);
      setAppointment(null);
      
      // Refrescar los datos
      await refetch();
    } catch (error) {
      console.error("Error al guardar el turno:", error);
      console.error("Tipo de error:", typeof error);
      console.error("Error detallado:", JSON.stringify(error, null, 2));
      if (error instanceof Error) {
        toast.error(`Error al guardar el turno: ${error.message}`);
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error(`Error al guardar el turno: ${(error as { message: string }).message}`);
      } else {
        toast.error("Error al guardar el turno");
      }
    }
  };
  
  // Función para manejar la edición de una cita
  const handleEditAppointment = (cita: Appointment) => {
    setAppointment(cita);
    setModalOpen(true);
  };
  
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) {
      return;
    }
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Encontrar la tarea que se está moviendo
    const task = kanbanTasks[draggableId];
    if (!task) {
      return;
    }
    
    let newEstado: EstadoCita = "pendiente";
    let newColumnId: ColumnId = "pendientes";
    
    switch (destination.droppableId) {
      case "pendientes":
        newEstado = "pendiente";
        newColumnId = "pendientes";
        break;
      case "completadas":
        newEstado = "completado";
        newColumnId = "completadas";
        break;
      case "canceladas":
        newEstado = "cancelado";
        newColumnId = "canceladas";
        break;
    }
    
    const sourceColumnId = source.droppableId as ColumnId;
    const destColumnId = destination.droppableId as ColumnId;
    
    // 1) Actualizar columnas localmente (optimistic update)
    setColumns((prev) => {
      const newColumns = { ...prev };
      
      const sourceColumn = newColumns[sourceColumnId];
      const destColumn = newColumns[destColumnId];
      
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      sourceTaskIds.splice(source.index, 1);
      
      if (sourceColumnId === destColumnId) {
        // Mover dentro de la misma columna
        sourceTaskIds.splice(destination.index, 0, draggableId);
        
        newColumns[sourceColumnId] = {
          ...sourceColumn,
          taskIds: sourceTaskIds,
        };
      } else {
        // Mover entre columnas distintas
        const destTaskIds = Array.from(destColumn.taskIds);
        destTaskIds.splice(destination.index, 0, draggableId);
        
        newColumns[sourceColumnId] = {
          ...sourceColumn,
          taskIds: sourceTaskIds,
        };
        newColumns[destColumnId] = {
          ...destColumn,
          taskIds: destTaskIds,
        };
      }
      
      return newColumns;
    });
    
    // Guardar el estado original para posibles reversiones
    const originalEstado = task.estado;
    const originalColumnId = task.columnId;
    
    try {
      // Actualizar el estado de la cita en la base de datos
      await updateCita({
        id_cita: task.id_cita,
        estado: newEstado
      });
      
      toast.success("Cita actualizada correctamente");
      
      // Refrescar los datos directamente sin setTimeout
      await refetch();
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      toast.error("Error al actualizar la cita");
      
      // En caso de error, revertir el cambio local
      // Refrescar para restaurar el estado anterior
      await refetch();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="qoder-dark-card p-6 text-center">
        <h3 className="text-lg font-medium text-red-500">Error al cargar las citas</h3>
        <p className="text-qoder-dark-text-secondary">No se pudieron cargar las citas. Intente refrescar la página.</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 qoder-dark-button-primary px-4 py-2 rounded-lg hover-lift smooth-transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Navegación de fechas */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button 
              onClick={goToPreviousDay}
              className="p-2 rounded-full qoder-dark-button"
              title="Día anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {getLocalDateString(currentDate) !== getLocalDateString(new Date()) && (
              <button 
                onClick={goToToday}
                className="px-3 py-2 rounded-lg qoder-dark-button text-sm font-medium"
              >
                Hoy
              </button>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-bold text-qoder-dark-text-primary">
              {currentDate.toLocaleDateString('es-UY', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <p className="text-qoder-dark-text-secondary text-sm">
              {citas?.length || 0} citas programadas
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={goToNextDay}
              className="p-2 rounded-full qoder-dark-button"
              title="Día siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Tablero Kanban principal - visible solo en pantallas medianas y grandes */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="hidden md:grid md:grid-cols-3 gap-6 w-full">
          {Object.values(columns).map((column) => {
            const columnTasks = column.taskIds
              .map(taskId => kanbanTasks[taskId])
              .filter(kanbanTask => kanbanTask !== undefined)
              .map(kanbanTask => convertToTaskCardFormat(kanbanTask));

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onEdit={handleEditAppointment}
              />
            );
          })}
        </div>
      </DragDropContext>
      
      {/* Mensaje para dispositivos móviles */}
      <div className="md:hidden text-center py-8">
        <div className="bg-qoder-dark-bg-secondary rounded-lg p-6 max-w-md mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-qoder-dark-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <h3 className="text-xl font-bold text-qoder-dark-text-primary mb-2">Vista de Tablero No Disponible</h3>
          <p className="text-qoder-dark-text-secondary mb-4">
            El tablero Kanban está optimizado para pantallas más grandes. 
            Para una mejor experiencia, accede desde una tablet o computadora.
          </p>
          <p className="text-sm text-qoder-dark-text-muted">
            En dispositivos móviles, utiliza la vista de agenda para gestionar tus turnos.
          </p>
        </div>
      </div>
      
      {/* Modal de nuevo turno */}
      {appointment && (
        <FinalAppointmentModal
          open={modalOpen}
          onOpenChange={(open: boolean) => {
            setModalOpen(open);
            if (!open) {
              setAppointment(null);
            }
          }}
          initial={appointment}
        />
      )}
    </div>
  );
}