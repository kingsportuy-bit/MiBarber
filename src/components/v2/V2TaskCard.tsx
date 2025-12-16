"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Appointment } from "@/types/db";
import { useClientesByIds } from "@/hooks/useClientes";
import { Client } from "@/types/db";

// Función para convertir puntaje a estrellas con borde dorado y sin relleno
const getStarsFromScore = (puntaje: number) => {
  // Para puntaje 0 y 1, mostrar 1 estrella
  // Para puntajes mayores, mostrar la cantidad correspondiente
  const starCount =
    puntaje <= 1 ? 1 : Math.min(5, Math.max(0, Math.floor(puntaje)));

  // Añadir solo estrellas vacías con borde dorado según el puntaje
  const stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push(
      <span key={`star-${i}`} className="text-amber-400 text-sm">
        ☆
      </span>,
    );
  }

  return <span className="tracking-wide">{stars}</span>;
};

// Interfaces para definir la estructura de datos de una tarea
interface Task {
  id: string;
  content: string;
  // Agregar datos completos de la cita para la edición
  cita?: Appointment;
}

// Props que recibe el componente V2TaskCard
interface V2TaskCardProps {
  task: Task;    // Datos de la tarea a renderizar
  index: number; // Índice de la tarea en la columna (necesario para drag and drop)
  onEdit?: (cita: Appointment) => void; // Función para editar la cita
}

export function V2TaskCard({ task, index, onEdit }: V2TaskCardProps) {
  // Obtener información del cliente
  const clienteIds = task.cita?.id_cliente ? [task.cita.id_cliente] : [];
  const { data: clientesData } = useClientesByIds(clienteIds);
  const clientData = clientesData?.[0];
  
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
      {(provided, snapshot) => {
        const baseStyle = provided.draggableProps.style || {};
        
        return (
          // Contenedor de la tarjeta de tarea
          <div
            // Ref necesaria para que @hello-pangea/dnd pueda manipular el DOM
            ref={provided.innerRef}
            // Props necesarios para la funcionalidad de draggable
            {...provided.draggableProps}
            // Props necesarios para el handle de arrastre (área donde se puede agarrar la tarjeta)
            {...provided.dragHandleProps}
            // Agregar doble clic para editar
            onDoubleClick={handleDoubleClick}
            style={{
              ...baseStyle,
              ...(snapshot.isDropAnimating
                ? {
                    // prácticamente sin animación al soltar
                    transitionDuration: "0.05s",
                    transitionTimingFunction: "linear",
                  }
                : {}),
            }}
            className={`mb-4 rounded-xl bg-qoder-dark-bg-secondary px-6 py-4 shadow-lg outline-none ${
              snapshot.isDragging ? "ring-2 ring-qoder-dark-border-primary" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-base font-semibold text-white">
                {task.cita?.hora?.slice(0, 5) || "Sin hora"}
              </span>
              <span className="text-sm text-white/60">
                ${task.cita?.ticket || 0}
              </span>
            </div>
            <div className="text-sm font-medium text-white flex items-center">
              {task.cita?.cliente_nombre || "Cliente"}
              {clientData && clientData.puntaje !== null && clientData.puntaje !== undefined && (
                <span className="ml-2">
                  {getStarsFromScore(clientData.puntaje)}
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-white/60">
              {task.cita?.servicio || "Sin servicio"}
              {task.cita?.duracion && ` · ${task.cita.duracion}min`}
            </div>
          </div>
        );
      }}
    </Draggable>
  );
}