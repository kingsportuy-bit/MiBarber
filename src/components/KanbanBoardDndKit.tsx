"use client";

import { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { useBloqueosPorDia } from "@/hooks/useBloqueosBarbero"; // Importar useBloqueosPorDia
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getLocalDateString, getLocalDateTime } from "@/utils/dateUtils";
import type { Appointment } from "@/types/db";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { toast } from "sonner";

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
const TaskCard = memo(({ 
  task, 
  dragOverlay = false, 
  onEdit,
  isDiaBloqueado,
  isHoraBloqueada
}: { 
  task: Task; 
  dragOverlay?: boolean;
  onEdit?: (task: Appointment) => void;
  isDiaBloqueado?: boolean;
  isHoraBloqueada?: (hora: string) => boolean;
}) => {
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
    // Optimizaciones para mejor rendimiento
    animateLayoutChanges: () => false, // Desactivar animaciones de layout changes
    transition: {
      duration: 150, // Reducir duración de transiciones
      easing: 'ease-out'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const overlayStyle = dragOverlay ? {
    zIndex: 1000,
    width: '300px',
    cursor: 'grabbing',
    position: 'fixed' as const,
    pointerEvents: 'none' as const,
    // transform: 'rotate(3deg)', // Eliminada la rotación que causaba el efecto visual
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  } : undefined;

  // Definir colores según el estado de la tarjeta
  const getTaskColorClasses = () => {
    switch (task.columnId) {
      case 'pendiente':
        return 'border-l-4 border-l-orange-500'; // Naranja para pendientes
      case 'confirmado':
        return 'border-l-4 border-l-blue-500'; // Azul para confirmadas
      case 'completado':
        return 'border-l-4 border-l-green-500'; // Verde para completadas
      case 'cancelado':
        return 'border-l-4 border-l-gray-500'; // Gris para canceladas
      default:
        return 'border-l-4 border-l-gray-300'; // Gris por defecto
    }
  };

  const columnaOrigen = columnStates.find(col => col.id === task.columnId)?.title || "Desconocida";

  // Sistema de doble clic robusto que no interfiere con drag
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Si hay movimiento significativo, marcamos que comenzó el drag
    if (!dragStartedRef.current) {
      const movementX = Math.abs(e.movementX);
      const movementY = Math.abs(e.movementY);
      if (movementX > 3 || movementY > 3) {
        dragStartedRef.current = true;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Si ya comenzó el drag, no procesamos el click
    if (dragStartedRef.current || dragOverlay || !onEdit) {
      dragStartedRef.current = false;
      return;
    }
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTimeRef.current;
    
    // Si el tiempo entre clicks es menor a 300ms, es doble click
    if (timeDiff < 300 && timeDiff > 0) {
      e.stopPropagation();
      e.preventDefault();
      // Agregar log para verificar los datos que se pasan a onEdit
      console.log('=== DEBUG TaskCard onEdit ===');
      console.log('Editando cita:', task);
      console.log('Fecha en task:', task.fecha);
      console.log('Hora en task:', task.hora);
      console.log('=== FIN DEBUG TaskCard onEdit ===');
      onEdit(task);
      lastClickTimeRef.current = 0;
      clickCountRef.current = 0;
    } else {
      // Primer click
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

  return (
    <div 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={dragOverlay ? { ...style, ...overlayStyle } : style}
      className={`
        qoder-dark-card rounded-xl p-3 md:p-4 shadow-sm transition-all duration-200
        ${dragOverlay ? 'cursor-grabbing shadow-xl scale-105' : 'cursor-grab hover:shadow-md hover-lift'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isDiaBloqueado ? 'opacity-50' : ''}
      `}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Indicador visual si la hora está bloqueada */}
      {isHoraBloqueada && task.hora && isHoraBloqueada(task.hora.slice(0, 5)) && (
        <div className="mb-2 flex items-center text-[10px] text-red-400 bg-red-500/20 px-2 py-1 rounded-md w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">Hora bloqueada</span>
        </div>
      )}
      
      {/* Indicador visual si el día está bloqueado */}
      {isDiaBloqueado && (
        <div className="mb-2 flex items-center text-[10px] text-red-400 bg-red-500/20 px-2 py-1 rounded-md w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">Día bloqueado</span>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-qoder-dark-text-primary text-sm truncate md:text-base">
            {task.cliente_nombre}
          </h4>
          <p className="text-xs text-qoder-dark-text-secondary truncate">
            {task.servicio}
          </p>
        </div>
        <span className="text-xs font-mono text-qoder-dark-text-secondary ml-2">
          {task.hora ? task.hora.slice(0, 5) : 'Sin hora'}
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
});

TaskCard.displayName = 'TaskCard';

// Componente para una columna droppable MEMOIZADO
const ColumnContainer = memo(({ 
  column, 
  tasks,
  isOver = false,
  onEdit,
  isDiaBloqueado,
  bloqueos,
  isHoraBloqueada,
}: { 
  column: Column; 
  tasks: Task[];
  isOver?: boolean;
  onEdit: (task: Appointment) => void;
  isDiaBloqueado?: boolean;
  bloqueos?: any[];
  isHoraBloqueada?: (hora: string) => boolean;
}) => {
  const { setNodeRef: setSortableNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });
  
  // Hacer la columna droppable
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: column.id,
  });

  // Combinar refs
  const setNodeRef = (node: HTMLDivElement) => {
    setSortableNodeRef(node);
    setDroppableNodeRef(node);
  };

  // Optimización: usar useMemo para evitar recrear el array innecesariamente
  const columnItems = useMemo(() => {
    return tasks.length > 0 ? tasks.map(t => t.id) : [];
  }, [tasks]);

  return (
    <div 
      ref={setNodeRef}
      data-column-id={column.id}
      className={`rounded-2xl p-4 md:p-5 min-h-[320px] transition-all duration-200 ${
        isOver 
          ? `${column.bgColor} ring-4 ring-inset ring-qoder-dark-accent-primary/50 bg-opacity-30 shadow-lg` 
          : 'bg-black shadow-md'
      }`}
      style={{ minHeight: '320px', position: 'relative' }}
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
        <SortableContext id={column.id} items={columnItems} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEdit} 
              isDiaBloqueado={isDiaBloqueado}
              isHoraBloqueada={isHoraBloqueada}
            />
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
});

ColumnContainer.displayName = 'ColumnContainer';

export function KanbanBoardDndKit({ onEdit, filters }: KanbanBoardDndKitProps) {
  console.log("=== DEBUG KanbanBoardDndKit ===");
  console.log("onEdit typeof:", typeof onEdit);
  console.log("filters:", filters);
  console.log("=== FIN DEBUG KanbanBoardDndKit ===");
  
  const queryClient = useQueryClient();
  const { barbero: barberoActual, isAdmin, idBarberia } = useBarberoAuth();
  const { sucursales } = useSucursales(idBarberia || undefined);
  const { filters: globalFilters } = useGlobalFilters(); // Usar filtros globales
  const [isInitialSelectionDone, setIsInitialSelectionDone] = useState(false); // Bandera para controlar la preseleccion inicial
  
  // Tipos para estados válidos - WRAPPED IN useMemo
  const validStates = useMemo(() => ["pendiente", "confirmado", "completado", "cancelado"] as const, []);
  type Estado = (typeof validStates)[number];
  
  // Estado canónico local para las columnas
  const [columns, setColumns] = useState<Record<Estado, Task[]>>(() => {
    const initialColumns = {} as Record<Estado, Task[]>;
    validStates.forEach(estado => {
      initialColumns[estado] = [];
    });
    return initialColumns;
  });
  
  // Función para encontrar el contenedor de una tarea - WRAPPED IN useCallback
  const findContainer = useCallback((id: UniqueIdentifier | null): Estado | null => {
    if (!id) return null;
    const s = String(id);
    
    // Si el id es un estado válido, devolverlo directamente
    if (validStates.includes(s as Estado)) {
      console.log('findContainer: ID es un estado válido:', s);
      return s as Estado;
    }
    
    // Si no, buscar en qué columna está la tarea
    for (const estado of validStates) {
      if ((columns[estado] ?? []).some(t => String(t.id) === s)) {
        console.log('findContainer: Encontrado en columna:', estado, 'para ID:', s);
        return estado;
      }
    }
    
    console.log('findContainer: No se encontró contenedor para ID:', s);
    return null;
  }, [columns, validStates]);
  
  // Usar los filtros globales o los filtros pasados como props
  const effectiveFilters = filters || globalFilters;
  
  const [selectedSucursal, setSelectedSucursal] = useState<string | undefined>(
    effectiveFilters?.sucursalId || undefined
  );
  const [selectedBarbero, setSelectedBarbero] = useState<string | undefined>(
    effectiveFilters?.barberoId || undefined
  );
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Si hay una fecha en los filtros, usarla, de lo contrario usar la fecha actual
    // Verificar qué tipo de filtro tenemos
    if (effectiveFilters) {
      // Para filtros locales (props)
      if ('fecha' in effectiveFilters && effectiveFilters.fecha) {
        return new Date(effectiveFilters.fecha);
      }
      // Para filtros globales
      if ('fechaInicio' in effectiveFilters && effectiveFilters.fechaInicio) {
        return new Date(effectiveFilters.fechaInicio);
      }
    }
    // Usar la fecha ajustada a la zona horaria local
    const localDate = getLocalDateTime();
    return localDate;
  }); // Usar Date en lugar de string
  
  // Convertir la fecha actual a string para usar en los hooks
  const selectedDate = useMemo(() => {
    // Usar la función de utilidad para obtener la fecha en formato correcto
    return getLocalDateString(currentDate);
  }, [currentDate]);
  
  // Añadir el hook de horarios después de que selectedSucursal esté definida
  const { horarios } = useHorariosSucursales(selectedSucursal);
  
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
  
  // Obtener bloqueos para el día actual
  const { data: bloqueos } = useBloqueosPorDia({
    idSucursal: selectedSucursal || '',
    idBarbero: selectedBarbero,
    fecha: selectedDate
  });
  
  // Verificar si el día está bloqueado
  const isDiaBloqueado = useMemo(() => {
    if (!bloqueos || bloqueos.length === 0) return false;
    
    // Verificar si hay un bloqueo de día completo
    return bloqueos.some((bloqueo: any) => bloqueo.tipo === 'bloqueo_dia');
  }, [bloqueos]);
  
  // Verificar si el día actual está disponible
  const isDiaDisponible = useMemo(() => {
    if (!selectedSucursal) return true; // Si no hay sucursal seleccionada, permitir
    
    // Ajustar la fecha para mantener consistencia con dateUtils
    const adjustedDate = new Date(currentDate);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
    const dayOfWeek = adjustedDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    return diasDisponibles.includes(dayOfWeek);
  }, [currentDate, diasDisponibles, selectedSucursal]);
  
  // Combinar días disponibles con verificación de bloqueos
  const isDiaDisponibleYNoBloqueado = useMemo(() => {
    return isDiaDisponible && !isDiaBloqueado;
  }, [isDiaDisponible, isDiaBloqueado]);
  
  // Función para verificar si una hora específica está bloqueada
  const isHoraBloqueada = useCallback((hora: string) => {
    if (!bloqueos || bloqueos.length === 0) return false;
    
    // Verificar si hay un bloqueo de día completo
    if (isDiaBloqueado) return true;
    
    // Verificar si hay bloqueos de horas o descansos que afecten esta hora
    return bloqueos.some((bloqueo: any) => {
      // Solo considerar bloqueos de horas o descansos
      if (bloqueo.tipo !== 'descanso' && bloqueo.tipo !== 'bloqueo_horas') {
        return false;
      }
      
      // Verificar si la hora cae dentro del rango del bloqueo
      if (bloqueo.hora_inicio && bloqueo.hora_fin) {
        return hora >= bloqueo.hora_inicio && hora < bloqueo.hora_fin;
      }
      
      return false;
    });
  }, [bloqueos, isDiaBloqueado]);
  
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
  
  // Solo obtener barberos si hay una sucursal seleccionada
  const { data: barberos } = useBarberosList(idBarberia, selectedSucursal || undefined);
  const { data: servicios } = useServiciosListPorSucursal(selectedSucursal);
  
  const { data: citas = [], isLoading, isError, refetch } = useCitas({
    sucursalId: selectedSucursal,
    fecha: selectedDate, // Usar la fecha formateada
    barberoId: selectedBarbero || (barberoActual?.id_barbero && !isAdmin ? barberoActual.id_barbero : undefined)
  });
  
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
      
      // Validar que el estado sea válido usando el mismo array de estados válido
      const columnId = validStates.includes(cita.estado as Estado) ? cita.estado : 'pendiente';
      
      // Asegurarnos de que todos los campos requeridos estén presentes
      const task = {
        ...cita,
        id: cita.id_cita,
        columnId: columnId,
        barberoNombre: barbero?.nombre || cita.barbero,
        servicioPrecio: servicio?.precio ?? cita.ticket ?? 0,
        servicioDuracion: servicio?.duracion_minutos,
        // Asegurarnos de que fecha y hora estén presentes y en el formato correcto
        fecha: cita.fecha || '',
        hora: cita.hora || '',
      };
      
      // Verificación adicional de campos críticos
      if (!task.fecha) {
        console.warn('Falta fecha en la cita:', cita);
      }
      if (!task.hora) {
        console.warn('Falta hora en la cita:', cita);
      }
      
      console.log('Task creada con todos los datos:', task);
      return task;
    });
  }, [citas, barberos, servicios]);

  // Efecto para sincronizar el estado local con los datos remotos
  useEffect(() => {
    // Crear las nuevas columnas basadas en las tareas actuales
    const newColumns = {} as Record<Estado, Task[]>;
    validStates.forEach(estado => {
      newColumns[estado] = tasks.filter(task => task.columnId === estado);
    });
    
    // Solo actualizar si las columnas realmente cambiaron
    setColumns(prevColumns => {
      // Verificar si las columnas son diferentes
      const hasChanged = validStates.some(estado => {
        const prevTasks = prevColumns[estado] || [];
        const newTasks = newColumns[estado] || [];
        
        // Si las longitudes son diferentes, definitivamente cambiaron
        if (prevTasks.length !== newTasks.length) {
          return true;
        }
        
        // Si las longitudes son iguales, verificar si los IDs son los mismos
        const prevIds = prevTasks.map(t => t.id).sort();
        const newIds = newTasks.map(t => t.id).sort();
        
        return JSON.stringify(prevIds) !== JSON.stringify(newIds);
      });
      
      // Solo actualizar si realmente cambiaron
      if (hasChanged) {
        return newColumns;
      }
      
      // Retornar el estado anterior si no hubo cambios
      return prevColumns;
    });
  }, [tasks, validStates]); // Añadido validStates como dependencia

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  // Estado para almacenar la columna de origen durante el drag
  const [sourceColumn, setSourceColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Previene drag accidental
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // Reducir distancia para mejor respuesta
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // Reducir delay para mejor UX
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Optimización de las tareas por columna usando useMemo
  const tasksByColumn = useMemo(() => {
    return columnStates.reduce((acc, column) => {
      acc[column.id] = tasks.filter(task => task.columnId === column.id);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveId(task.id);
      // Al iniciar el drag, almacenamos la columna de origen
      const sourceCol = findContainer(active.id);
      setSourceColumn(sourceCol);
      console.log('DragStart - Columna de origen:', sourceCol);
    }
    
    document.body.style.overflow = 'hidden';
  }, [tasks, findContainer]);

  const handleDragOver = useCallback((event: any) => {
    const { active, over } = event;
    
    // Registrar información para debugging
    console.log('🔍 DEBUG DRAG OVER:', {
      activeId: active.id,
      overId: over?.id,
      overData: over?.data,
    });
    
    if (!over) {
      setOverColumn(null);
      return;
    }
    
    const overColumnId = findContainer(over.id);
    setOverColumn(overColumnId);
    
    // Si active y over están en la misma columna, no hacer nada
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    
    console.log('🔍 DEBUG CONTAINERS:', {
      activeContainer,
      overContainer,
      isSameContainer: activeContainer === overContainer
    });
    
    if (activeContainer === overContainer) {
      return;
    }
    
    // Verificar si el día está bloqueado antes de permitir el movimiento
    if (isDiaBloqueado) {
      console.log('🚫 Movimiento bloqueado - Día bloqueado');
      toast.error("No se pueden mover citas en un día bloqueado");
      return;
    }
    
    // Verificar si la hora de la cita está bloqueada
    const task = tasks.find(t => t.id === active.id);
    if (task && task.hora && isHoraBloqueada && isHoraBloqueada(task.hora.slice(0, 5))) {
      console.log('🚫 Movimiento bloqueado - Hora bloqueada');
      toast.error("No se pueden mover citas en una hora bloqueada");
      return;
    }
  }, [tasks, findContainer, isDiaBloqueado, isHoraBloqueada]);

  // Función para validar transiciones de estado
  const isValidStatusTransition = (currentStatus: string, targetStatus: string): boolean => {
    // Implementar lógica de validación según las reglas de negocio
    // Por ahora permitimos todas las transiciones
    return true;
  };

  // Función para actualizar el estado de una cita
  const updateCitaStatus = useCallback(async (citaId: string, newStatus: string) => {
    try {
      console.log('Iniciando actualización de cita:', { citaId, newStatus });
      
      // Verificar que los parámetros sean válidos
      if (!citaId || !newStatus) {
        const errorMsg = `Parámetros inválidos: citaId=${citaId}, newStatus=${newStatus}`;
        console.error('Error de validación en updateCitaStatus:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Verificar que el nuevo estado sea válido
      if (!validStates.includes(newStatus as Estado)) {
        const errorMsg = `Estado inválido: ${newStatus}. Estados válidos: ${validStates.join(', ')}`;
        console.error('Error de validación de estado en updateCitaStatus:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Registrar el objeto supabase para verificar que esté correctamente inicializado
      console.log('Supabase client:', supabase);
      
      // Registrar la operación antes de ejecutarla
      console.log('Ejecutando actualización en Supabase:', {
        table: "mibarber_citas",
        updateData: { estado: newStatus },
        condition: { id_cita: citaId }
      });
      
      const result = await (supabase as any)
        .from("mibarber_citas")
        .update({ estado: newStatus })
        .eq("id_cita", citaId)
        .select()
        .single();
      
      const { data, error } = result;
      
      console.log('Respuesta completa de Supabase:', { result, data, error });
      
      // Verificar si hay error de Supabase
      if (error) {
        // Registrar el error tal como viene
        console.error('Error directo de Supabase:', error);
        
        // Crear un objeto de error más detallado
        const errorDetails = {
          message: error.message || 'Error desconocido de Supabase',
          code: error.code || 'UNKNOWN_ERROR',
          details: error.details || 'No hay detalles adicionales',
          hint: error.hint || 'No hay sugerencias disponibles',
          citaId,
          newStatus,
          fullError: error // Registrar el error completo
        };
        
        console.error('Error en updateCitaStatus - Detalles completos:', JSON.stringify(errorDetails, null, 2));
        throw new Error(`Error al actualizar cita: ${errorDetails.message} (Código: ${errorDetails.code})`);
      }
      
      // Verificar si no se obtuvieron datos
      if (!data) {
        const warnMsg = `No se encontró la cita para actualizar: ${citaId}`;
        console.warn(warnMsg);
        throw new Error(warnMsg);
      }
      
      console.log('Cita actualizada exitosamente:', { citaId, newStatus, data });
      
      // Verificar que la actualización realmente se haya realizado
      if (data.estado !== newStatus) {
        const warnMsg = `La cita no se actualizó correctamente. Estado esperado: ${newStatus}, Estado actual: ${data.estado}`;
        console.warn(warnMsg);
        throw new Error(warnMsg);
      }
      
      return data;
    } catch (error: any) {
      // Manejo más robusto de errores
      console.error('Excepción capturada en updateCitaStatus:', error);
      
      const errorMessage = error?.message || 'Error desconocido en la actualización';
      const errorStack = error?.stack || 'No stack trace disponible';
      
      // Registrar error con más detalle
      const errorInfo = {
        message: errorMessage,
        stack: errorStack,
        citaId,
        newStatus,
        timestamp: new Date().toISOString(),
        typeofError: typeof error,
        errorKeys: error ? Object.keys(error) : [],
        fullError: error // Registrar el error completo
      };
      
      console.error('Excepción en updateCitaStatus - Detalles completos:', JSON.stringify(errorInfo, null, 2));
      
      // Lanzar un nuevo error con mensaje más claro
      throw new Error(`Fallo en actualización de cita: ${errorMessage}`);
    }
  }, [supabase, validStates]); // Añadido supabase y validStates como dependencias

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setOverColumn(null);
      document.body.style.overflow = "";

      if (!over) {
        setSourceColumn(null);
        return;
      }

      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask) {
        setSourceColumn(null);
        return;
      }

      const sourceEstado = activeTask.columnId;
      const targetEstado = findContainer(over.id);
      
      // Verificar que targetEstado no sea null
      if (!targetEstado) {
        console.log('No se pudo determinar la columna de destino');
        setSourceColumn(null);
        return;
      }

      setSourceColumn(null);

      if (sourceEstado === targetEstado) {
        const columnTasks = columns[sourceEstado as Estado];
        const activeIndex = columnTasks.findIndex((task) => task.id === active.id);
        const overIndex = columnTasks.findIndex((task) => task.id === over.id);

        if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
          setColumns((prev) => {
            const newList = [...prev[sourceEstado as Estado]];
            const [moved] = newList.splice(activeIndex, 1);
            newList.splice(overIndex, 0, moved);

            return {
              ...prev,
              [sourceEstado as Estado]: newList,
            };
          });
        }
        return;
      }

      if (isDiaBloqueado) {
        toast.error("No se pueden mover citas en un día bloqueado");
        return;
      }

      if (activeTask.hora && isHoraBloqueada(activeTask.hora.slice(0, 5))) {
        toast.error("No se pueden mover citas en una hora bloqueada");
        return;
      }

      try {
        setColumns((prev) => {
          const sourceItems = [...prev[sourceEstado as Estado]];
          const targetItems = [...prev[targetEstado as Estado]];

          const taskIndex = sourceItems.findIndex((t) => t.id === active.id);
          if (taskIndex !== -1) {
            const [movedTask] = sourceItems.splice(taskIndex, 1);
            targetItems.push({ ...movedTask, columnId: targetEstado, estado: targetEstado });
          }

          return { ...prev, [sourceEstado]: sourceItems, [targetEstado]: targetItems };
        });

        await updateCitaStatus(active.id as string, targetEstado);
        await refetch();
        toast.success("Cita movida correctamente");
      } catch (error: any) {
        toast.error(error.message || "Error al mover cita");
        await refetch();
      }
    },
    [tasks, columns, findContainer, isDiaBloqueado, isHoraBloqueada, updateCitaStatus, refetch]
  );

  const handleDragCancel = useCallback(() => {
    document.body.style.overflow = '';
    setActiveId(null);
    setOverColumn(null);
  }, []);

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
          {isDiaBloqueado ? (
            <p className="text-qoder-dark-text-error text-xs md:text-sm">
              Día bloqueado - no se pueden crear citas
            </p>
          ) : !isDiaDisponible && selectedSucursal ? (
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
      
      {/* Mostrar mensaje cuando el día no está disponible o está bloqueado */}
      {selectedSucursal && (!isDiaDisponible || isDiaBloqueado) ? (
        <div className="text-center py-8">
          <p className="text-qoder-dark-text-warning text-lg font-medium">
            {isDiaBloqueado 
              ? "Este día está bloqueado" 
              : "Este día no está disponible para la sucursal seleccionada"}
          </p>
          <p className="text-qoder-dark-text-secondary text-sm mt-2">
            {isDiaBloqueado
              ? "No se pueden crear ni mover citas en un día bloqueado"
              : "No hay horario configurado para este día"}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {/* Hacer las columnas responsive - 1 columna en móviles, 2 en tablets, 4 en escritorio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columnStates.map((column) => (
              <ColumnContainer 
                key={column.id}
                column={column} 
                tasks={columns[column.id as Estado] || []} 
                isOver={overColumn === column.id}
                onEdit={onEdit}
                // Pasar información de bloqueos a las columnas
                isDiaBloqueado={isDiaBloqueado}
                bloqueos={bloqueos}
                isHoraBloqueada={isHoraBloqueada}
              />
            ))}
          </div>
          
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
            style={{
              zIndex: 1000,
              cursor: "grabbing",
              position: "fixed",
              pointerEvents: "none",
              width: "300px",
            }}
          >
            {activeId ? (
              <TaskCard
                task={tasks.find((t) => t.id === activeId)!}
                dragOverlay={true}
                onEdit={onEdit}
                isDiaBloqueado={isDiaBloqueado}
                isHoraBloqueada={isHoraBloqueada}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

    </div>
  );
}

export default KanbanBoardDndKit;