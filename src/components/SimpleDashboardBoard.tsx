"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { Appointment } from "@/types/db";

// Datos de prueba
const initialAppointments: Appointment[] = [
  {
    id_cita: "1",
    fecha: "2023-10-15",
    hora: "10:00:00",
    cliente_nombre: "Juan Pérez",
    servicio: "Corte de cabello",
    estado: "pendiente",
    nota: null,
    creado: "2023-10-14T10:00:00Z",
    id_cliente: null,
    duracion: "30m",
    notificacion_barbero: null,
    notificacion_cliente: null,
    ticket: 1500,
    nro_factura: null,
    barbero: "Carlos López",
    metodo_pago: null,
    id_barberia: "barberia-1",
    id_sucursal: "sucursal-1",
    id_barbero: "barbero-1",
    id_servicio: "servicio-1",
  },
  {
    id_cita: "2",
    fecha: "2023-10-15",
    hora: "11:00:00",
    cliente_nombre: "María González",
    servicio: "Barba",
    estado: "confirmado",
    nota: null,
    creado: "2023-10-14T11:00:00Z",
    id_cliente: null,
    duracion: "20m",
    notificacion_barbero: null,
    notificacion_cliente: null,
    ticket: 1000,
    nro_factura: null,
    barbero: "Carlos López",
    metodo_pago: null,
    id_barberia: "barberia-1",
    id_sucursal: "sucursal-1",
    id_barbero: "barbero-1",
    id_servicio: "servicio-2",
  },
  {
    id_cita: "3",
    fecha: "2023-10-15",
    hora: "12:00:00",
    cliente_nombre: "Pedro Ramírez",
    servicio: "Corte y barba",
    estado: "completado",
    nota: null,
    creado: "2023-10-14T12:00:00Z",
    id_cliente: null,
    duracion: "50m",
    notificacion_barbero: null,
    notificacion_cliente: null,
    ticket: 2500,
    nro_factura: null,
    barbero: "Carlos López",
    metodo_pago: null,
    id_barberia: "barberia-1",
    id_sucursal: "sucursal-1",
    id_barbero: "barbero-1",
    id_servicio: "servicio-3",
  },
];

const columnTitles = {
  pendiente: "Pendientes",
  confirmado: "Confirmadas",
  completado: "Completadas",
  cancelado: "Canceladas",
};

const columnColors = {
  pendiente: "text-yellow-500",
  confirmado: "text-blue-500",
  completado: "text-green-500",
  cancelado: "text-red-500",
};

export function SimpleDashboardBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    console.log("handleDragEnd called with:", { destination, source, draggableId });

    // Si no hay destino, no hacer nada
    if (!destination) {
      console.log("No destination, returning");
      return;
    }

    // Si se soltó en la misma posición, no hacer nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log("Same position, returning");
      return;
    }

    // Encontrar la cita que se está moviendo
    const cita = appointments.find(c => c.id_cita === draggableId);
    if (!cita) {
      console.error("No se encontró la cita con ID:", draggableId);
      return;
    }

    console.log("Cita encontrada:", cita);

    // Si se mueve a una columna diferente, actualizar el estado
    if (destination.droppableId !== source.droppableId) {
      // Actualizar el estado de la cita
      const updatedAppointments = appointments.map(c => 
        c.id_cita === draggableId 
          ? { ...c, estado: destination.droppableId as Appointment["estado"] } 
          : c
      );
      
      setAppointments(updatedAppointments);
      console.log("Estado de cita actualizado correctamente");
    }
  };

  // Agrupar citas por estado
  const citasPorEstado = {
    pendiente: appointments.filter(c => c.estado === "pendiente"),
    confirmado: appointments.filter(c => c.estado === "confirmado"),
    completado: appointments.filter(c => c.estado === "completado"),
    cancelado: appointments.filter(c => c.estado === "cancelado"),
  };

  return (
    <div className="qoder-dark-card p-6">
      <h2 className="text-xl font-bold mb-4">Tablero Kanban Simplificado</h2>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(citasPorEstado).map((estado) => (
            <Droppable key={estado} droppableId={estado} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-qoder-dark-bg-secondary rounded-lg p-4 ${snapshot.isDraggingOver ? 'bg-opacity-80' : ''}`}
                >
                  <h3 className={`font-semibold ${columnColors[estado as keyof typeof columnColors]} mb-3`}>
                    {columnTitles[estado as keyof typeof columnTitles]} ({citasPorEstado[estado as keyof typeof citasPorEstado].length})
                  </h3>
                  <div className="space-y-2">
                    {citasPorEstado[estado as keyof typeof citasPorEstado].map((cita, index) => (
                      <Draggable key={cita.id_cita} draggableId={cita.id_cita} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`qoder-dark-card p-3 hover-lift smooth-transition ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-qoder-dark-text-primary">{cita.cliente_nombre}</h4>
                                <p className="text-sm text-qoder-dark-text-secondary">{cita.servicio}</p>
                              </div>
                              <span className="text-sm font-medium text-qoder-dark-accent-primary">
                                ${cita.ticket}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-qoder-dark-text-secondary">
                                {cita.barbero}
                              </span>
                              <span className="text-xs text-qoder-dark-text-secondary">
                                {cita.hora.slice(0, 5)}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {citasPorEstado[estado as keyof typeof citasPorEstado].length === 0 && (
                      <div className="text-center py-4 text-qoder-dark-text-secondary text-sm">
                        Sin citas
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}