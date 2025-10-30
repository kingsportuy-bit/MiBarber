import { useState } from "react";
import type { Appointment } from "@/types/db";
import { useAgendaLogic } from "./hooks/useAgendaLogic";
import { AgendaHeader } from "./AgendaHeader";
import { AgendaTimeSlots } from "./AgendaTimeSlots";
import { GlobalFilters } from '@/components/shared/GlobalFilters';
import { useGlobalFilters } from "@/hooks/useGlobalFilters";

interface AgendaContainerProps {
  onEdit: (appointment: Appointment) => void;
}

export function AgendaContainer({ onEdit }: AgendaContainerProps) {
  const { filters } = useGlobalFilters();
  
  const {
    // Estados
    currentDate,
    setCurrentDate,
    isLoading,
    sucursalId,
    barberoId,
    
    // Datos computados
    horarioDelDia,
    diasDisponibles,
    isDiaDisponible,
    horarioCombinado,
    timeSlots,
    citasMapeadas,
    citasPorHora,
    mapaOcupacion,
    canGoToPreviousDay,
    canGoToNextDay,
    
    // Datos de contexto
    sucursales,
    barberos,
    servicios,
    horarios,
    todosLosHorarios,
    citas,
    
    // Contexto
    isAdmin,
    barberiaSegura,
    sucursalSegura,
    
    // Handlers
    goToPreviousDay,
    goToNextDay,
    goToToday,
    
    // Funciones auxiliares
    isLunchTime,
    formatDate,
    getPosicionVertical,
    getAlturaPorDuracion,
    getAlturaEntreHoras,
  } = useAgendaLogic({ 
    selectedSucursal: filters.sucursalId || undefined, 
    selectedBarbero: filters.barberoId || undefined 
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AgendaHeader 
        currentDate={currentDate}
        goToPreviousDay={goToPreviousDay}
        goToNextDay={goToNextDay}
        goToToday={goToToday}
        canGoToPreviousDay={canGoToPreviousDay}
        canGoToNextDay={canGoToNextDay}
        formatDate={formatDate}
      />
      
      {/* Filtros globales */}
      <GlobalFilters showDateFilters={false} />
      
      <div className="flex-grow mt-4">
        <AgendaTimeSlots 
          timeSlots={timeSlots}
          citasPorHora={citasPorHora}
          mapaOcupacion={mapaOcupacion}
          isLunchTime={isLunchTime}
          horarioDelDia={horarioDelDia}
          onEdit={onEdit}
          getPosicionVertical={getPosicionVertical}
        />
      </div>
    </div>
  );
}