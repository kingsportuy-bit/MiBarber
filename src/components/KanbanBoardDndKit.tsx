"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { useSucursales } from "@/hooks/useSucursales";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getLocalDateString, getLocalDateTime } from "@/utils/dateUtils";
import type { Appointment } from "@/types/db";

interface KanbanBoardDndKitProps {
  onEdit: (appointment: Appointment) => void;
  filters?: {
    sucursalId?: string;
    barberoId?: string;
    fecha?: string;
  };
}

interface Column {
  id: string;
  title: string;
  color: string;
  bgColor: string;
}

interface Task extends Appointment {
  id: UniqueIdentifier;
  columnId: string;
  barberoNombre?: string;
  servicioPrecio?: number;
  servicioDuracion?: number;
}

const columnStates: Column[] = [
  { id: "pendiente", title: "Pendientes", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { id: "confirmado", title: "Confirmadas", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "completado", title: "Completadas", color: "text-green-500", bgColor: "bg-green-500/10" },
  { id: "cancelado", title: "Canceladas", color: "text-gray-500", bgColor: "bg-gray-500/10" },
];

// Componente para una tarjeta arrastrable
function TaskCard({ 
  task, 
  dragOverlay = false, 
  onEdit 
}: { 
  task: Task; 
  dragOverlay?: boolean;
  onEdit?: (task: Appointment) => void;
}) {
  const lastClickTimeRef = useRef<number>(0);
  const clickCountRef = useRef<number>(0);
  const dragStartedRef = useRef<boolean>(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overlayStyle = dragOverlay ? {
    zIndex: 1000,
    width: '300px',
    cursor: 'grabbing',
    position: 'fixed' as const,
    pointerEvents: 'none' as const,
    transform: 'rotate(3deg)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  } : {};

  const columnaOrigen = columnStates.find(col => col.id === task.columnId)?.title || "Desconocida";

  // Sistema de doble clic robusto que no interfiere con drag
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Si hay movimiento significativo, marcamos que comenzó el drag
    dragStartedRef.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Si ya comenzó el drag, no procesamos el click
    if (dragStartedRef.current || dragOverlay || !onEdit) {
      dragStartedRef.current = false;
      return;
    }
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTimeRef.current;
    
    console.log('Click detectado:', {
      currentTime,
      lastClickTime: lastClickTimeRef.current,
      timeDiff,
      clickCount: clickCountRef.current
    });
    
    // Si el tiempo entre clicks es menor a 300ms, es doble click
    if (timeDiff < 300 && timeDiff > 0) {
      console.log('Doble click detectado, abriendo modal para:', task);
      e.stopPropagation();
      e.preventDefault();
      onEdit(task);
      lastClickTimeRef.current = 0;
      clickCountRef.current = 0;
    } else {
      // Primer click
      console.log('Primer click registrado');
      lastClickTimeRef.current = currentTime;
      clickCountRef.current = 1;
    }
  };

  // Crear listeners personalizados que manejen correctamente el doble click y drag
  const customListeners = dragOverlay ? {} : {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      handlePointerDown(e);
      if (listeners && listeners.onPointerDown) {
        listeners.onPointerDown(e);
      }
    },
    onPointerMove: (e: React.PointerEvent) => {
      handlePointerMove(e);
      if (listeners && listeners.onPointerMove) {
        listeners.onPointerMove(e);
      }
    },
    onPointerUp: (e: React.PointerEvent) => {
      handlePointerUp(e);
      if (listeners && listeners.onPointerUp) {
        listeners.onPointerUp(e);
      }
    },
  };

  console.log('TaskCard render:', {
    id: task.id,
    servicio: task.servicio,
    servicioDuracion: task.servicioDuracion,
    servicioPrecio: task.servicioPrecio
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style, 
        ...overlayStyle,
        userSelect: 'none', // Evitar selección de texto
        WebkitUserSelect: 'none', // Compatibilidad con Safari
        MozUserSelect: 'none', // Compatibilidad con Firefox
        msUserSelect: 'none', // Compatibilidad con IE
        touchAction: 'none', // Evitar acciones táctiles que puedan interferir
      }}
      className={`bg-qoder-dark-bg-form rounded-lg p-3 transition-all duration-200 ease-in-out border border-qoder-dark-border ${
        isDragging 
          ? 'shadow-2xl scale-105 z-50 opacity-95 ring-4 ring-qoder-dark-accent-primary/50' 
          : '' // Eliminar efectos hover para mantener las tarjetas estáticas
      }`}
      {...attributes}
      {...customListeners}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-qoder-dark-text-primary text-sm truncate">
            {task.cliente_nombre}
          </h4>
          <p className="text-qoder-dark-text-secondary text-xs mt-1 truncate">
            {task.servicio}
          </p>
        </div>
        <span className="text-base font-bold text-qoder-dark-accent-primary ml-2 flex-shrink-0 bg-qoder-dark-bg-primary/20 px-1.5 py-0.5 rounded-md">
          ${task.servicioPrecio || task.ticket || 0}
        </span>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-qoder-dark-text-secondary bg-qoder-dark-bg-primary/30 px-2 py-0.5 rounded-full truncate max-w-[60%]">
          {task.barberoNombre || task.barbero}
        </span>
        <span className="text-xs font-semibold text-qoder-dark-text-primary bg-qoder-dark-bg-primary/30 px-1.5 py-0.5 rounded-md">
          {task.hora.slice(0, 5)}
        </span>
      </div>
      
      {dragOverlay && (
        <div className="mt-1 text-[10px] text-qoder-dark-text-secondary italic">
          Arrastrando desde: {columnaOrigen}
        </div>
      )}
      
      {/* Mostrar duración del servicio - responsive */}
      {task.duracion && (
        <div className="mt-2 flex items-center text-[10px] text-qoder-dark-text-secondary bg-qoder-dark-bg-primary/30 px-2 py-0.5 rounded-md w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{task.duracion}</span>
        </div>
      )}
      
      {task.nota && (
        <div className="mt-2 text-[10px] text-qoder-dark-text-muted italic p-2 bg-qoder-dark-bg-primary/20 rounded-md border-l border-qoder-dark-accent-primary/30">
          "{task.nota}"
        </div>
      )}
      
      {!dragOverlay && (
        <div className="mt-2 text-[9px] text-qoder-dark-text-muted text-center opacity-70 bg-qoder-dark-bg-primary/10 py-0.5 rounded-md">
          Doble click para editar
        </div>
      )}
    </div>
  );
}

// Componente para una columna droppable
function ColumnContainer({ 
  column, 
  tasks,
  isOver = false,
  onEdit
}: { 
  column: Column; 
  tasks: Task[];
  isOver?: boolean;
  onEdit: (task: Appointment) => void;
}) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const columnItems = tasks.length > 0 ? tasks.map(t => t.id) : [column.id];

  return (
    <div 
      ref={setNodeRef}
      className={`rounded-2xl p-4 md:p-5 h-full transition-all duration-200 ${
        isOver 
          ? `${column.bgColor} ring-4 ring-inset ring-qoder-dark-accent-primary/50 bg-opacity-30 shadow-lg` 
          : 'bg-black shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-qoder-dark-border">
        <h3 className={`font-bold text-lg ${column.color}`}>
          {column.title}
        </h3>
        <span className="bg-qoder-dark-bg-primary text-qoder-dark-text-primary text-sm font-bold px-3 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-4 min-h-[150px]">
        <SortableContext items={columnItems} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
          
          {tasks.length === 0 && (
            <div 
              className="w-full min-h-[120px] flex items-center justify-center text-center py-6 text-qoder-dark-text-secondary text-sm rounded-xl border-2 border-dashed border-qoder-dark-border/50 bg-qoder-dark-bg-primary/10 backdrop-blur-sm"
            >
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-qoder-dark-text-secondary/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="block font-medium">Suelta aquí para mover la cita</span>
              </div>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoardDndKit({ onEdit, filters }: KanbanBoardDndKitProps) {
  console.log("KanbanBoardDndKit renderizado, onEdit:", typeof onEdit);
  
  const { barbero: barberoActual, isAdmin, idBarberia } = useBarberoAuth();
  const { sucursales } = useSucursales(idBarberia || undefined);
  const [isInitialSelectionDone, setIsInitialSelectionDone] = useState(false); // Bandera para controlar la preseleccion inicial
  
  const [selectedSucursal, setSelectedSucursal] = useState<string | undefined>(filters?.sucursalId);
  const [selectedBarbero, setSelectedBarbero] = useState<string | undefined>(filters?.barberoId);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Usar la fecha ajustada a la zona horaria local
    const localDate = getLocalDateTime();
    return localDate;
  }); // Usar Date en lugar de string
  
  // Añadir el hook de horarios después de que selectedSucursal esté definida
  const { horarios } = useHorariosSucursales(selectedSucursal);
  
  // Preseleccionar la sucursal cuando se carguen las sucursales
  // Solo preseleccionar si no se ha hecho la selección inicial
  useEffect(() => {
    if (sucursales && sucursales.length > 0 && !isInitialSelectionDone) {
      // Para barberos normales, seleccionar automáticamente su sucursal
      if (!isAdmin && barberoActual?.id_sucursal) {
        setSelectedSucursal(barberoActual.id_sucursal);
      } else {
        // Para administradores, seleccionar la primera sucursal por defecto
        setSelectedSucursal(sucursales[0].id);
      }
      // Marcar que se ha hecho la selección inicial
      setIsInitialSelectionDone(true);
    }
  }, [sucursales, isInitialSelectionDone, isAdmin, barberoActual?.id_sucursal]);
  
  // Convertir la fecha actual a string para usar en los hooks
  const selectedDate = useMemo(() => {
    // Usar la función de utilidad para obtener la fecha en formato correcto
    return getLocalDateString(currentDate);
  }, [currentDate]);
  
  // Solo obtener barberos si hay una sucursal seleccionada
  const { data: barberos } = useBarberosList(idBarberia, selectedSucursal || undefined);
  const { data: servicios } = useServiciosListPorSucursal(selectedSucursal);
  
  const { data: citas = [], isLoading, isError, refetch } = useCitas(
    selectedSucursal,
    selectedDate, // Usar la fecha formateada
    selectedBarbero || (barberoActual?.id_barbero && !isAdmin ? barberoActual.id_barbero : undefined)
  );
  
  const supabase = getSupabaseClient();
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Log para debug
  useEffect(() => {
    console.log('Servicios disponibles:', servicios);
    console.log('Citas recibidas:', citas);
    console.log('Barberos disponibles:', barberos);
  }, [servicios, citas, barberos]);
  
  // Convertir citas a tareas con datos mapeados correctamente y ordenar por horario
  const tasks: Task[] = useMemo(() => {
    if (!citas) {
      console.log('No hay citas');
      return [];
    }
    
    console.log('Mapeando citas:', citas.length);
    
    // Ordenar las citas por horario
    const citasOrdenadas = [...citas].sort((a, b) => {
      // Comparar por hora (formato HH:MM:SS)
      return a.hora.localeCompare(b.hora);
    });
    
    return citasOrdenadas.map(cita => {
      // Encontrar el nombre del barbero
      const barbero = barberos?.find((b: any) => b.id_barbero === cita.barbero);
      
      // Encontrar el servicio completo
      const servicio = servicios?.find((s: any) => s.nombre === cita.servicio);
      
      console.log('Mapeando cita:', {
        id: cita.id_cita,
        servicio: cita.servicio,
        servicioEncontrado: servicio,
        duracion: servicio?.duracion_minutos,
        precio: servicio?.precio
      });
      
      const task = {
        ...cita,
        id: cita.id_cita,
        columnId: cita.estado,
        barberoNombre: barbero?.nombre || cita.barbero,
        servicioPrecio: servicio?.precio ?? cita.ticket ?? 0,
        servicioDuracion: servicio?.duracion_minutos
      };
      
      console.log('Task creada:', task);
      return task;
    });
  }, [citas, barberos, servicios]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Distancia mínima para activar drag
        delay: 100, // Pequeño delay para permitir clicks
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByColumn = columnStates.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.columnId === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (!over) {
      setOverColumn(null);
      return;
    }
    
    const column = columnStates.find(c => c.id === over.id);
    if (column) {
      setOverColumn(column.id);
      return;
    }
    
    const overTask = tasks.find(t => t.id === over.id);
    if (overTask) {
      setOverColumn(overTask.columnId);
      return;
    }
    
    setOverColumn(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setOverColumn(null);
    const draggedTask = activeTask || tasks.find(t => t.id === active.id);
    setActiveTask(null);
    
    if (!over || !draggedTask) {
      return;
    }
    
    let targetColumnId: string | null = null;
    
    const overColumn = columnStates.find(c => c.id === over.id);
    if (overColumn) {
      targetColumnId = overColumn.id;
    }
    
    if (!targetColumnId) {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        targetColumnId = overTask.columnId;
      }
    }
    
    if (!targetColumnId || draggedTask.columnId === targetColumnId) {
      return;
    }
    
    try {
      const { data, error } = await (supabase as any)
        .from("mibarber_citas")
        .update({ estado: targetColumnId })
        .eq("id_cita", draggedTask.id_cita)
        .select()
        .single();
      
      if (error) {
        console.error("Error al actualizar cita:", error);
        alert("Error al actualizar el estado de la cita. Por favor, inténtelo de nuevo.");
      } else {
        console.log(`Cita ${draggedTask.id_cita} actualizada a estado: ${targetColumnId}`);
        refetch();
      }
    } catch (error) {
      console.error("Error al actualizar cita:", error);
      alert("Error al actualizar el estado de la cita. Por favor, inténtelo de nuevo.");
    }
  };

  // Navegar a días anteriores/siguientes usando la misma lógica que la agenda
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  // Ir al día de hoy
  const goToToday = () => {
    // Usar la fecha ajustada a la zona horaria local
    const localDate = getLocalDateTime();
    setCurrentDate(localDate);
  };

  // Determinar qué días están disponibles según los horarios de la sucursal
  const diasDisponibles = useMemo(() => {
    if (!horarios || horarios.length === 0) return [];
    
    // Crear un array con todos los días de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    
    // Encontrar los días que tienen horarios activos
    const activeDays = horarios
      .filter(horario => horario.activo)
      .map(horario => {
        // Ahora JavaScript y la base de datos usan el mismo esquema:
        // 0=Domingo, 1=Lunes, 2=Martes, ..., 6=Sábado
        return horario.id_dia;
      });
    
    return activeDays;
  }, [horarios]);
  
  
  // Verificar si el día actual está disponible
  const isDiaDisponible = useMemo(() => {
    if (!selectedSucursal) return true; // Si no hay sucursal seleccionada, permitir
    
    // Ajustar la fecha para mantener consistencia con dateUtils
    const adjustedDate = new Date(currentDate);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
    const dayOfWeek = adjustedDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    return diasDisponibles.includes(dayOfWeek);
  }, [currentDate, diasDisponibles, selectedSucursal]);

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
  
  // Formatear la fecha para mostrar
  const formatDate = (date: Date) => {
    // Usar la función de utilidad para formatear la fecha
    const localDateString = getLocalDateString(date);
    const [year, month, day] = localDateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString('es-UY', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  return (
    <div ref={boardRef} className="qoder-dark-card p-4 md:p-6 rounded-xl">
      {/* Encabezado con navegación de fechas - responsive */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
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
        
        <div className="text-center flex-1 mx-2">
          <h2 className="text-lg md:text-2xl font-bold text-qoder-dark-text-primary">
            {formatDate(currentDate)}
          </h2>
          {!isDiaDisponible && selectedSucursal ? (
            <p className="text-qoder-dark-text-warning text-xs md:text-sm">
              Día no disponible - sin horario configurado
            </p>
          ) : (
            <p className="text-qoder-dark-text-secondary text-xs md:text-sm">
              {citas?.length || 0} citas programadas
            </p>
          )}
        </div>
        
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
      
      {isAdmin && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
              Sucursal
            </label>
            <select
              value={selectedSucursal || ""}
              onChange={(e) => {
                const newSucursal = e.target.value || undefined;
                setSelectedSucursal(newSucursal);
                // Resetear el barbero seleccionado cuando cambia la sucursal
                setSelectedBarbero(undefined);
              }}
              className="qoder-dark-select w-full px-3 py-2 rounded-lg"
            >
              {sucursales?.map((sucursal: any) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
              Barbero
            </label>
            <select
              value={selectedBarbero || ""}
              onChange={(e) => setSelectedBarbero(e.target.value || undefined)}
              className="qoder-dark-select w-full px-3 py-2 rounded-lg"
              // Deshabilitar el selector si no hay sucursal seleccionada
              disabled={!selectedSucursal}
            >
              <option value="">Todos</option>
              {barberos?.map((barberoItem: any) => (
                <option key={barberoItem.id_barbero} value={barberoItem.id_barbero}>
                  {barberoItem.nombre}
                </option>
              ))}
            </select>
            {!selectedSucursal && (
              <p className="text-xs text-qoder-dark-text-secondary mt-1">
                Seleccione una sucursal primero
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Mostrar mensaje cuando el día no está disponible */}
      {selectedSucursal && !isDiaDisponible ? (
        <div className="text-center py-8">
          <p className="text-qoder-dark-text-warning text-lg font-medium">
            Este día no está disponible para la sucursal seleccionada
          </p>
          <p className="text-qoder-dark-text-secondary text-sm mt-2">
            No hay horario configurado para este día
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Hacer las columnas responsive - 1 columna en móviles, 2 en tablets, 4 en escritorio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columnStates.map((column) => (
              <ColumnContainer 
                key={column.id}
                column={column} 
                tasks={tasksByColumn[column.id]} 
                isOver={overColumn === column.id}
                onEdit={onEdit}
              />
            ))}
          </div>
          
          <DragOverlay 
            dropAnimation={null}
          >
            {activeTask ? <TaskCard task={activeTask} dragOverlay={true} onEdit={onEdit} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

export default KanbanBoardDndKit;