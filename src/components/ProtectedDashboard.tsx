"use client";

import { useState, useEffect } from "react";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useRouter } from "next/navigation";
import KanbanBoardDndKit from "@/components/KanbanBoardDndKit";
import { ResponsiveNewAppointmentButton } from "@/components/ResponsiveNewAppointmentButton";
import type { Appointment } from "@/types/db";

interface ProtectedDashboardProps {
  onEdit: (appointment: Appointment) => void;
  onCreate?: () => void; // Hacer opcional para mantener compatibilidad
}

export function ProtectedDashboard({ onEdit, onCreate }: ProtectedDashboardProps) {
  const auth = useBarberoAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Redirigir a la página de login si no está autenticado
  useEffect(() => {
    // Solo redirigir si ya terminamos de cargar y no estamos autenticados
    if (!auth.isLoading && !auth.isAuthenticated && isClient) {
      console.log("ProtectedDashboard: Usuario no autenticado, redirigiendo a login");
      router.push("/login");
    }
  }, [auth.isLoading, auth.isAuthenticated, isClient, router]);
  
  // Mostrar estado de carga si aún no estamos en el cliente o si la autenticación está cargando
  if (!isClient || auth.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }
  
  // Si no está autenticado, mostrar mensaje o redirigir
  if (!auth.isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-qoder-dark-text-secondary">Acceso denegado. Redirigiendo al login...</p>
        </div>
      </div>
    );
  }
  
  console.log("ProtectedDashboard renderizado, onEdit:", typeof onEdit);
  
  // Si está autenticado, mostrar el tablero Kanban
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-qoder-dark-text-primary">Tablero de Turnos</h2>
        {onCreate && (
          <div className="hidden md:block">
            <button 
              onClick={onCreate}
              className="qoder-dark-button-primary px-4 py-3 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
            >
              <span>+</span>
              <span>Nuevo Turno</span>
            </button>
          </div>
        )}
      </div>
      
      {onCreate && (
        <div className="md:hidden">
          <ResponsiveNewAppointmentButton onCreate={onCreate} />
        </div>
      )}
      
      <KanbanBoardDndKit onEdit={onEdit} />
    </div>
  );
}