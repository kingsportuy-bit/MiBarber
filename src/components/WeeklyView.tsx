"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useCitas } from "@/hooks/useCitas";
import type { Appointment } from "@/types/db";

interface DayEvents {
  date: Date;
  events: Appointment[];
}

// Función para obtener la fecha en la zona horaria de Uruguay
const getUruguayDate = (date: Date = new Date()) => {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * -3)); // UTC-3 para Uruguay
};

export function WeeklyView({ 
  barbero,
  onEventClick
}: { 
  barbero?: string;
  onEventClick?: (appointment: Appointment) => void;
}) {
  // Convertir el ID de barbero de string a número si es necesario
  const barberoId = barbero ? parseInt(barbero, 10) : undefined;
  const { data: citas, isLoading } = useCitas(undefined, undefined, barberoId?.toString());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(getUruguayDate(), { weekStartsOn: 1 }));

  // Generar los días de la semana (lunes a sábado) usando useMemo para evitar recrearlos innecesariamente
  const days = useMemo(() => {
    const newDays: DayEvents[] = [];
    for (let i = 0; i < 6; i++) {
      const date = addDays(currentWeekStart, i);
      newDays.push({ date, events: [] });
    }
    return newDays;
  }, [currentWeekStart]);

  // Asignar citas a los días correspondientes usando useMemo
  const daysWithEvents = useMemo(() => {
    if (!citas) return days;

    return days.map((day: DayEvents) => ({
      ...day,
      events: citas.filter(cita => 
        isSameDay(new Date(cita.fecha), day.date)
      ).sort((a, b) => a.hora.localeCompare(b.hora))
    }));
  }, [citas, days]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(startOfWeek(addDays(currentWeekStart, -7), { weekStartsOn: 1 }));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(startOfWeek(addDays(currentWeekStart, 7), { weekStartsOn: 1 }));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(getUruguayDate(), { weekStartsOn: 1 }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-qoder-dark-bg-form rounded-lg border border-qoder-dark-border-primary">
      {/* Barra de herramientas */}
      <div className="flex items-center justify-between mb-6 p-4 bg-qoder-dark-bg-form rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrevWeek}
            className="p-3 rounded-full bg-qoder-dark-button-secondary text-qoder-dark-button-secondary-text hover:bg-qoder-dark-button-secondary-hover transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={handleToday}
            className="px-5 py-3 rounded-lg bg-qoder-dark-button-secondary text-qoder-dark-button-secondary-text hover:bg-qoder-dark-button-secondary-hover transition-all duration-300 transform hover:scale-105 shadow-md font-medium"
          >
            Hoy
          </button>
          <button 
            onClick={handleNextWeek}
            className="p-3 rounded-full bg-qoder-dark-button-secondary text-qoder-dark-button-secondary-text hover:bg-qoder-dark-button-secondary-hover transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-qoder-dark-text-primary">
          {format(currentWeekStart, "MMMM yyyy")}
        </h2>
        <div className="w-24"></div> {/* Espacio para equilibrar */}
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-6 gap-0 bg-qoder-dark-bg-form flex-grow">
        {daysWithEvents.map((day: DayEvents, index: number) => {
          const appointmentsForDay = day.events;

          return (
            <div 
              key={index} 
              className="flex flex-col border-r border-qoder-dark-border-primary last:border-r-0"
            >
              {/* Encabezado del día */}
              <div className="p-3 border-b border-qoder-dark-border-primary bg-qoder-dark-bg-tertiary">
                <div className="text-center">
                  <div className="text-sm font-medium text-qoder-dark-text-secondary uppercase">
                    {format(day.date, "EEE")}
                  </div>
                  <div className="text-2xl font-bold text-qoder-dark-text-primary mt-1">
                    {format(day.date, "d")}
                  </div>
                </div>
              </div>

              {/* Eventos del día */}
              <div className="flex-grow overflow-y-auto p-2 custom-scrollbar">
                {appointmentsForDay.length > 0 ? (
                  <div className="space-y-3">
                    {appointmentsForDay.map((appointment: Appointment) => (
                      <div 
                        key={appointment.id_cita}
                        className="qoder-dark-calendar-event cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                        onClick={() => onEventClick?.(appointment)}
                      >
                        <div className="font-semibold text-qoder-dark-text-primary">
                          {appointment.cliente_nombre}
                        </div>
                        <div className="text-sm text-qoder-dark-text-secondary mt-1">
                          {appointment.servicio}
                        </div>
                        <div className="text-sm font-medium mt-2">
                          {appointment.hora} · {appointment.duracion}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-qoder-dark-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2">No hay citas programadas</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}