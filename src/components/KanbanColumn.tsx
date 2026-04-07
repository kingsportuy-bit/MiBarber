"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "@/components/TaskCard";
import type { Appointment } from "@/types/db";

interface Task {
  id: string;
  content: string;
  cita?: Appointment;
}

interface Column {
  id: string;
  title: string;
  color: string;
  taskIds: string[];
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onEdit?: (cita: Appointment) => void;
}

export function KanbanColumn({ column, tasks, onEdit }: KanbanColumnProps) {
  const getColumnStyles = (color: string) => {
    switch (color) {
      case "orange":
        return {
          headerBg: "rgba(197, 160, 89, 0.12)",
          headerBorder: "#C5A059",
          headerText: "#C5A059",
          dropBg: "rgba(197, 160, 89, 0.03)",
          countBg: "rgba(197, 160, 89, 0.2)",
        };
      case "blue":
        return {
          headerBg: "rgba(59, 130, 246, 0.12)",
          headerBorder: "#3b82f6",
          headerText: "#3b82f6",
          dropBg: "rgba(59, 130, 246, 0.03)",
          countBg: "rgba(59, 130, 246, 0.2)",
        };
      case "green":
        return {
          headerBg: "rgba(16, 185, 129, 0.12)",
          headerBorder: "#10b981",
          headerText: "#10b981",
          dropBg: "rgba(16, 185, 129, 0.03)",
          countBg: "rgba(16, 185, 129, 0.2)",
        };
      case "gray":
        return {
          headerBg: "rgba(239, 68, 68, 0.10)",
          headerBorder: "#ef4444",
          headerText: "#ef4444",
          dropBg: "rgba(239, 68, 68, 0.02)",
          countBg: "rgba(239, 68, 68, 0.2)",
        };
      default:
        return {
          headerBg: "rgba(138, 138, 138, 0.1)",
          headerBorder: "#8A8A8A",
          headerText: "#8A8A8A",
          dropBg: "rgba(138, 138, 138, 0.02)",
          countBg: "rgba(138, 138, 138, 0.2)",
        };
    }
  };

  const styles = getColumnStyles(column.color);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header con borde izquierdo coloreado */}
      <div
        style={{
          background: styles.headerBg,
          borderLeft: `3px solid ${styles.headerBorder}`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            margin: 0,
            color: styles.headerText,
            letterSpacing: "0.04em",
            fontFamily: "var(--font-rasputin), serif",
          }}
        >
          {column.title}
        </h2>
        <span
          style={{
            background: styles.countBg,
            color: styles.headerText,
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "2px 8px",
            fontFamily: "var(--font-body)",
          }}
        >
          {column.taskIds.length}
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 px-3 py-3 space-y-3 overflow-y-auto"
            style={{
              backgroundColor: snapshot.isDraggingOver
                ? styles.headerBg
                : styles.dropBg,
              transition: "background-color 0.2s ease",
              height: "100%",
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onEdit={onEdit} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}