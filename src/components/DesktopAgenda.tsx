"use client";

import { useState, useEffect, useMemo } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { FinalAppointmentModalModificado } from "@/components/FinalAppointmentModalModificado";
import type { Appointment } from "@/types/db";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon, PlusIcon } from "@heroicons/react/24/outline";
import { CalendarWithBloqueos } from "@/components/CalendarWithBloqueos";
import { useCliente, useClientesByIds } from "@/hooks/useClientes";
import { Client } from "@/types/db";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { GlobalFilters } from "@/components/shared/GlobalFilters";

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
      <span key={`star-${i}`} className="text-amber-400 text-lg">
        ☆
      </span>,
    );
  }

  return <span className="tracking-wide">{stars}</span>;
};

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  citas?: Appointment[]; // Agregar la propiedad de citas
}

export function DesktopAgenda() {
  // ========================================
  // SIMPLIFICADO: Usar datos directos como /inicio
  // ========================================
  const { barbero: barberoActual, isAdmin } = useBarberoAuth();
  const { filters } = useGlobalFilters();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [view, setView] = useState<'calendar' | 'day'>('calendar'); // calendar or day view

  // Calcular el primer y último día del mes para obtener todas las citas del mes
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // ========================================
  // CONSULTAR CITAS CON DATOS DIRECTOS (como KanbanBoard)
  // ========================================
  const citasQuery = useCitas({
    sucursalId: filters.sucursalId || barberoActual?.id_sucursal || undefined,
    fecha: getLocalDateString(selectedDate), // Agregar fecha como KanbanBoard
    barberoId: isAdmin ? filters.barberoId || undefined : barberoActual?.id_barbero || undefined,
  });

  const { data: citasData, isLoading, error, refetch } = citasQuery;
  console.log('📊 Datos de citas recibidos:', { citasData, isLoading, error });

  // Obtener citas para todo el mes usando el rango
  const { data: citasMesData } = citasQuery.useCitasPorRango(
    filters.sucursalId || barberoActual?.id_sucursal || undefined,
    firstDayOfMonth.toISOString().split('T')[0],
    lastDayOfMonth.toISOString().split('T')[0],
    isAdmin ? filters.barberoId || undefined : barberoActual?.id_barbero || undefined
  );
  console.log('🗓️ Datos de citas por rango:', citasMesData);


  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };


  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // First day of the calendar (Sunday of the week containing the 1st)
    const startDay = new Date(firstDay);
    startDay.setDate(firstDay.getDate() - firstDay.getDay());
    // Last day of the calendar (Saturday of the week containing the last day)
    const endDay = new Date(lastDay);
    endDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const days: CalendarDay[] = [];
    const today = new Date();
    const current = new Date(startDay);

    // Crear un mapa de citas por fecha para acceso rápido
    const citasPorFecha: { [key: string]: Appointment[] } = {};
    // Usar citasMesData para el calendario (todo el mes) en lugar de citasData (solo un día)
    if (citasMesData) {
      console.log('📋 Citas del mes antes de filtrar:', citasMesData);

      // Aplicar filtro adicional por barbero si es necesario
      let citasFiltradas = citasMesData.filter(cita => cita.estado !== "cancelado");

      // Si hay un barbero específico seleccionado, filtrar por ese barbero
      if (isAdmin && filters.barberoId) {
        citasFiltradas = citasFiltradas.filter(cita => cita.id_barbero === filters.barberoId);
      }

      console.log('✅ Citas del mes después de filtrar:', citasFiltradas);
      citasFiltradas.forEach(cita => {
        const fechaParts = cita.fecha.split('T');
        const fechaStr = fechaParts[0];

        if (!citasPorFecha[fechaStr]) {
          citasPorFecha[fechaStr] = [];
        }
        citasPorFecha[fechaStr].push(cita);
      });
    }
    console.log('📅 Mapa de citas por fecha:', citasPorFecha);

    while (current <= endDay) {
      // Formatear la fecha del día actual en el mismo formato que las citas
      const fechaStr = current.toISOString().split('T')[0];
      const citasDelDia = citasPorFecha[fechaStr] || [];

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === today.toDateString(),
        isSelected: current.toDateString() === selectedDate.toDateString(),
        citas: citasDelDia
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Handle day selection
  const handleDaySelect = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setView('day');
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // Handle new appointment
  const handleNewAppointment = () => {
    const newAppointment: Partial<Appointment> = {
      fecha: getLocalDateString(selectedDate),
      hora: "",
      servicio: "",
      barbero: ""
    };

    setSelectedAppointment(newAppointment as Appointment);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };


  // Obtener IDs únicos de clientes de las citas filtradas
  const clienteIds = citasData
    ? Array.from(new Set(citasData
      .map(cita => cita.id_cliente)
      .filter((id): id is string => id !== null && id !== undefined)))
    : [];

  // Obtener información de todos los clientes necesarios
  const { data: clientesData, isLoading: clientesLoading } = useClientesByIds(clienteIds);

  // Crear un mapa de clientes por ID para acceso rápido
  const clientesMap = clientesData
    ? clientesData.reduce((acc, cliente) => {
      acc[cliente.id_cliente] = cliente;
      return acc;
    }, {} as Record<string, Client>)
    : {};

  return (
    // Contenedor principal que engloba todo el contenido con márgenes adecuados para desktop
    <div className="flex flex-col w-full bg-transparent px-8 py-1">
      {/* Título de la agenda - compartido por ambas vistas */}

      {/* Filtros Globales y Botón Nuevo Turno en la misma línea */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <GlobalFilters />
        </div>
        <div>
          <button
            onClick={handleNewAppointment}
            className="bg-[#C5A059] hover:bg-[#D4B068] text-black py-3 px-6 rounded-none font-bold transition-all duration-200 whitespace-nowrap"
          >
            + Nuevo Turno
          </button>
        </div>
      </div>

      {/* Vista de Calendario */}
      {view === 'calendar' && (
        <div className="flex-1 pb-8">
          {/* Navegación de Mes */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-3 rounded-none hover:bg-qoder-dark-bg-secondary transition-colors duration-200"
            >
              <ChevronLeftIcon className="h-6 w-6 text-qoder-dark-text-primary" />
            </button>
            <h2 className="text-xl font-semibold text-qoder-dark-text-primary">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-3 rounded-none hover:bg-qoder-dark-bg-secondary transition-colors duration-200"
            >
              <ChevronRightIcon className="h-6 w-6 text-qoder-dark-text-primary" />
            </button>
          </div>

          {/* Encabezados de Día de la Semana */}
          <div className="grid grid-cols-7 gap-0 mb-0">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div
                key={day}
                className="text-center text-lg font-semibold text-orange-500 py-3 bg-transparent"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Cuadrícula del Calendario */}
          <div className="grid grid-cols-7 gap-1 mb-8">
            {calendarDays.map((day, index) => {
              // Contar las citas del día
              const citaCount = day.citas ? day.citas.length : 0;

              return (
                <div
                  key={index}
                  className="h-20 flex items-center justify-center bg-transparent"
                >
                  <div
                    onClick={() => handleDaySelect(day)}
                    className={`flex flex-col items-center justify-center text-base w-full h-full rounded transition-all duration-200 cursor-pointer ${day.isToday ? 'bg-[#C5A059] text-black font-bold' :
                      day.isSelected ? 'bg-gray-700 text-qoder-dark-text-primary' : 'bg-[#0a0a0a]/65 text-qoder-dark-text-primary'
                      } hover:bg-[rgba(197,160,89,0.1)] hover:scale-[0.98]`}
                    style={{
                      opacity: day.isCurrentMonth ? 1 : 0.5,
                      border: '1px solid rgba(75, 85, 99, 0.2)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                    }}
                  >
                    <span className="text-lg font-semibold">{day.date.getDate()}</span>
                    {citaCount > 0 && (
                      <div className="mt-1 flex items-center justify-center">
                        <span className="bg-[#111] text-[#C5A059] border border-[#C5A059] text-xs font-bold rounded-none h-5 w-5 flex items-center justify-center">
                          {citaCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendario FullCalendar para vista desktop - DESACTIVADO */}
          {/* 
          <div className="mt-8">
            <CalendarWithBloqueos
              sucursalId={filters.sucursalId || undefined}
              barbero={filters.barberoId || undefined}
              onEdit={handleAppointmentClick}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setView('day');
              }}
              initialView="dayGridMonth"
            />
          </div>
          */}
        </div>
      )
      }

      {/* Vista de Día */}
      {
        view === 'day' && (
          <div className="flex flex-col flex-1">
            {/* Botón de volver al calendario y fecha */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setView("calendar")}
                className="text-white text-base font-medium flex items-center bg-qoder-dark-button-secondary hover:bg-qoder-dark-button-secondary-hover py-2 px-4 rounded-none transition-colors duration-200"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-2" />
                Volver
              </button>

              <h2 className="text-xl font-semibold text-qoder-dark-text-primary">
                {formatDate(selectedDate)}
              </h2>
            </div>

            {/* Lista de Citas: contenedor que crece/achica según cantidad */}
            <div className="flex flex-col gap-4 flex-1">
              {isLoading ? (
                <div className="text-center py-12 text-qoder-dark-text-secondary flex items-center justify-center">
                  Cargando citas...
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500 flex items-center justify-center">
                  Error al cargar las citas: {error?.message || 'Error desconocido'}
                </div>
              ) : citasData && citasData.length > 0 ? (
                <div className="space-y-4 pb-6">
                  {citasData
                    .filter(cita => {
                      // Filtrar solo las citas del día seleccionado
                      const citaFecha = cita.fecha.split('T')[0];
                      const selectedFecha = selectedDate.toISOString().split('T')[0];
                      return citaFecha === selectedFecha;
                    })
                    .filter(cita => cita.estado !== "cancelado") // Filtrar citas canceladas
                    .sort((a, b) => {
                      // Ordenar por hora
                      return a.hora.localeCompare(b.hora);
                    })
                    .map((appointment) => {
                      // Obtener información del cliente del mapa
                      const clientData = appointment.id_cliente ? clientesMap[appointment.id_cliente] : undefined;

                      // Status color mapping
                      const statusColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
                        completado: { bg: 'rgba(16,185,129,0.08)', text: '#10b981', border: 'rgba(16,185,129,0.3)', dot: '#10b981' },
                        pendiente: { bg: 'rgba(197,160,89,0.08)', text: '#C5A059', border: 'rgba(197,160,89,0.3)', dot: '#C5A059' },
                        confirmado: { bg: 'rgba(59,130,246,0.08)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)', dot: '#3b82f6' },
                      };
                      const colors = statusColors[appointment.estado] || statusColors.pendiente;

                      const estadoLabel = appointment.estado === 'completado' ? 'Completado' : appointment.estado === 'confirmado' ? 'Confirmado' : 'Pendiente';

                      return (
                        <div
                          key={appointment.id_cita}
                          onClick={() => handleAppointmentClick(appointment)}
                          className="transition-all duration-200"
                          style={{
                            background: '#0a0a0a',
                            border: '1px solid #1a1a1a',
                            borderLeft: `3px solid ${colors.dot}`,
                            padding: 0,
                            overflow: 'hidden',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'stretch' }}>
                            {/* Time block */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '16px 20px',
                              borderRight: '1px solid #1a1a1a',
                              minWidth: 80,
                              background: 'rgba(255,255,255,0.02)',
                            }}>
                              <span style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#F5F0EB',
                                fontFamily: 'var(--font-body)',
                                letterSpacing: '0.02em',
                              }}>
                                {appointment.hora.substring(0, 5)}
                              </span>
                              <span style={{
                                fontSize: '0.6875rem',
                                color: '#8A8A8A',
                                fontFamily: 'var(--font-body)',
                                marginTop: 2,
                              }}>
                                {appointment.duracion} min
                              </span>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{
                                    fontWeight: 600,
                                    color: '#F5F0EB',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-body)',
                                  }}>
                                    {appointment.cliente_nombre}
                                  </span>
                                  {clientData && clientData.puntaje !== null && clientData.puntaje !== undefined && (
                                    <span style={{ marginLeft: 2 }}>
                                      {getStarsFromScore(clientData.puntaje)}
                                    </span>
                                  )}
                                </div>
                                <div style={{
                                  color: '#8A8A8A',
                                  fontSize: '0.8125rem',
                                  marginTop: 4,
                                  fontFamily: 'var(--font-body)',
                                }}>
                                  {appointment.servicio}
                                </div>
                                {/* Notas */}
                                {appointment.nota && (
                                  <div style={{
                                    marginTop: 4,
                                    fontSize: '0.75rem',
                                    color: 'rgba(255,255,255,0.35)',
                                    fontStyle: 'italic',
                                    fontFamily: 'var(--font-body)',
                                    maxWidth: 280,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}>
                                    {appointment.nota}
                                  </div>
                                )}
                              </div>

                              {/* Status badge */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                background: colors.bg,
                                border: `1px solid ${colors.border}`,
                                padding: '5px 12px',
                                flexShrink: 0,
                              }}>
                                <span style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: colors.dot,
                                  display: 'inline-block',
                                }} />
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  color: colors.text,
                                  fontFamily: 'var(--font-body)',
                                }}>
                                  {estadoLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12 text-qoder-dark-text-secondary flex items-center justify-center">
                  No hay citas programadas para este día
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* Modal de Cita */}
      <FinalAppointmentModalModificado
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        initial={selectedAppointment || undefined}
      />
    </div >
  );
}