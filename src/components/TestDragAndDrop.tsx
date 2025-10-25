"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Item {
  id: string;
  content: string;
}

// Datos de prueba
const initialItems = {
  pendiente: [
    { id: "1", content: "Cita con Juan Pérez - 10:00 AM" },
    { id: "2", content: "Cita con María González - 11:00 AM" }
  ],
  confirmado: [
    { id: "3", content: "Cita con Carlos López - 2:00 PM" }
  ],
  completado: [
    { id: "4", content: "Cita con Ana Martínez - 9:00 AM" }
  ],
  cancelado: [] as Item[]
};

type ItemsType = {
  [key: string]: Item[];
};

const columnStates = [
  { id: "pendiente", title: "Pendientes", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { id: "confirmado", title: "Confirmadas", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "completado", title: "Completadas", color: "text-green-500", bgColor: "bg-green-500/10" },
  { id: "cancelado", title: "Canceladas", color: "text-red-500", bgColor: "bg-red-500/10" },
];

export function TestDragAndDrop() {
  const [items, setItems] = useState<ItemsType>(initialItems);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Si no hay destino, no hacer nada
    if (!destination) {
      return;
    }

    // Si se soltó en la misma posición, no hacer nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Encontrar el item que se está moviendo
    const sourceColumn = [...items[source.droppableId]];
    const item = sourceColumn.find(i => i.id === draggableId);
    if (!item) {
      return;
    }

    // Remover el item de la columna de origen
    const newSourceColumn = [...sourceColumn];
    newSourceColumn.splice(source.index, 1);

    // Agregar el item a la columna de destino
    const destColumn = [...items[destination.droppableId]];
    destColumn.splice(destination.index, 0, item);

    // Actualizar el estado
    setItems({
      ...items,
      [source.droppableId]: newSourceColumn,
      [destination.droppableId]: destColumn
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-qoder-dark-text-primary">Prueba de Arrastrar y Soltar</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columnStates.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl p-4 transition-all duration-200 ${
                    snapshot.isDraggingOver 
                      ? `${column.bgColor} border-2 border-dashed ${column.color.replace('text', 'border')}` 
                      : 'bg-qoder-dark-bg-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold ${column.color}`}>
                      {column.title}
                    </h3>
                    <span className="bg-qoder-dark-bg-primary text-qoder-dark-text-primary text-xs font-semibold px-2 py-1 rounded-full">
                      {items[column.id].length}
                    </span>
                  </div>
                  
                  <div className="space-y-3 min-h-[100px]">
                    {items[column.id].map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`qoder-dark-card rounded-lg p-4 shadow-sm transition-all duration-200 ${
                              snapshot.isDragging 
                                ? 'shadow-lg scale-[102%] z-10' 
                                : 'hover:shadow-md hover-lift'
                            }`}
                          >
                            <div className="font-medium text-qoder-dark-text-primary">
                              {item.content}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items[column.id].length === 0 && (
                      <div className="text-center py-8 text-qoder-dark-text-secondary text-sm rounded-lg border-2 border-dashed border-qoder-dark-border">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-qoder-dark-text-secondary/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Suelta aquí
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