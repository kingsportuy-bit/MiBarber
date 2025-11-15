"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "@/components/TaskCard";
import type { Appointment } from "@/types/db";

// Interfaces para definir la estructura de datos
interface Task {
  id: string;
  content: string;
  // Agregar datos completos de la cita para la edición
  cita?: Appointment;
}

interface Column {
  id: string;
  title: string;
  color: string;
  taskIds: string[];
}

interface KanbanColumnProps {
  column: Column; // Datos de la columna a renderizar
  tasks: Task[];  // Tareas que pertenecen a esta columna
  onEdit?: (cita: Appointment) => void; // Función para editar una cita
}

export function KanbanColumn({ column, tasks, onEdit }: KanbanColumnProps) {
  // Función para obtener las clases de color según el tipo de columna
  // Esto permite aplicar estilos específicos según el estado de la columna
  const getColumnColorClasses = (color: string) => {
    switch (color) {
      case "orange":
        return "bg-orange-500"; // Color para columnas de tareas pendientes
      case "green":
        return "bg-green-500";  // Color para columnas de tareas completadas
      case "gray":
        return "bg-gray-500";   // Color para columnas de tareas canceladas
      default:
        return "bg-gray-500";   // Color por defecto
    }
  };

  return (
    // Contenedor principal de la columna que ocupa todo el alto disponible
    <div className="flex flex-col h-full">
      {/* 
        Encabezado de la columna con:
        - Título de la columna
        - Número de tareas en la columna
        - Color de fondo según el tipo de columna
      */}
      <h2 className={`text-lg font-bold p-2 rounded-t-lg ${getColumnColorClasses(column.color)} bg-opacity-20`}>
        {column.title} ({column.taskIds.length})
      </h2>
      
      {/* 
        Área droppable donde se pueden soltar las tareas
        - droppableId: identificador único de la columna para el drag and drop
      */}
      <Droppable droppableId={column.id}>
        {/* 
          Render props de Droppable:
          - provided: contiene props necesarios para la funcionalidad de droppable
          - snapshot: contiene información sobre el estado actual del droppable
        */}
        {(provided, snapshot) => (
          // Contenedor del área droppable
          <div
            // Ref necesaria para que @hello-pangea/dnd pueda manipular el DOM
            ref={provided.innerRef}
            // Props necesarios para la funcionalidad de droppable
            {...provided.droppableProps}
            // Estilos condicionales según si hay un drag en progreso sobre esta columna
            className={`flex-grow p-2 min-h-[100px] rounded-b-lg ${
              snapshot.isDraggingOver 
                ? "bg-gray-700" 
                : "bg-gray-800"
            } bg-opacity-10`}
          >
            {/* 
              Mapeamos y renderizamos las tareas de la columna
              - key: identificador único para React
              - task: datos de la tarea
              - index: posición de la tarea en la columna (necesario para drag and drop)
            */}
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onEdit={onEdit} />
            ))}
            {/* 
              Placeholder necesario para que @hello-pangea/dnd funcione correctamente
              Se ocupa del espacio durante las operaciones de drag and drop
            */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}