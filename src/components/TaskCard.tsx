"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Appointment } from "@/types/db";

// Interfaces para definir la estructura de datos de una tarea
interface Task {
  id: string;
  content: string;
  // Agregar datos completos de la cita para la edición
  cita?: Appointment;
}

// Props que recibe el componente TaskCard
interface TaskCardProps {
  task: Task;    // Datos de la tarea a renderizar
  index: number; // Índice de la tarea en la columna (necesario para drag and drop)
  onEdit?: (cita: Appointment) => void; // Función para editar la cita
}

export function TaskCard({ task, index, onEdit }: TaskCardProps) {
  // Manejar doble clic para editar
  const handleDoubleClick = () => {
    if (task.cita && onEdit) {
      onEdit(task.cita);
    }
  };

  return (
    // Componente draggable que permite arrastrar la tarea
    // - draggableId: identificador único de la tarea
    // - index: posición de la tarea en la columna
    <Draggable draggableId={task.id} index={index}>
      {/* 
        Render props de Draggable:
        - provided: contiene props necesarios para la funcionalidad de draggable
        - snapshot: contiene información sobre el estado actual del draggable
      */}
      {(provided, snapshot) => (
        // Contenedor de la tarjeta de tarea
        <div
          // Ref necesaria para que @hello-pangea/dnd pueda manipular el DOM
          ref={provided.innerRef}
          // Props necesarios para la funcionalidad de draggable
          {...provided.draggableProps}
          // Props necesarios para el handle de arrastre (área donde se puede agarrar la tarjeta)
          {...provided.dragHandleProps}
          // Estilos condicionales según si la tarjeta está siendo arrastrada
          className={`p-3 mb-2 rounded-lg shadow-md ${
            snapshot.isDragging 
              ? "bg-qoder-dark-bg-form border border-qoder-dark-accent-orange" 
              : "bg-qoder-dark-bg-form"
          }`}
          // Agregar doble clic para editar
          onDoubleClick={handleDoubleClick}
        >
          {/* Contenido de la tarjeta de tarea con el nuevo diseño */}
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              {/* Hora y nombre - tamaño y color blanco */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-medium">
                  {task.cita?.hora?.slice(0, 5) || 'Sin hora'}
                </span>
                <span className="text-white font-medium truncate">
                  {task.cita?.cliente_nombre || 'Cliente'}
                </span>
              </div>
              
              {/* Servicio y duración - 50% opacidad */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white text-opacity-50 truncate">
                  {task.cita?.servicio || 'Sin servicio'}
                </span>
                {task.cita?.duracion && (
                  <span className="text-white text-opacity-50">
                    {task.cita.duracion}min
                  </span>
                )}
              </div>
            </div>
            
            {/* Precio al extremo derecho - menor tamaño, 50% opacidad */}
            <div className="text-right ml-2">
              <span className="text-white text-opacity-50 text-sm font-medium">
                ${task.cita?.ticket || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}