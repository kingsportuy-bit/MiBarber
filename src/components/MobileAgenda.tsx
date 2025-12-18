"use client";

import { useState, useEffect, useMemo } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { FinalAppointmentModal } from "@/components/FinalAppointmentModal";
import type { Appointment } from "@/types/db";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  citas?: Appointment[]; // Agregar la propiedad de citas
}

export function MobileAgenda() {
  // ========================================
  // SIMPLIFICADO: Usar datos directos como /inicio
  // ========================================
  const { barbero: barberoActual, isAdmin } = useBarberoAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [view, setView] = useState<'calendar' | 'day'>('calendar');

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // ========================================
  // CONSULTAR CITAS CON DATOS DIRECTOS (como KanbanBoard)
  // ========================================
  const citasQuery = useCitas({
    sucursalId: barberoActual?.id_sucursal || undefined,
    fecha: getLocalDateString(selectedDate),
    barberoId: barberoActual?.id_barbero || undefined,
  });

  const { data: citasData, isLoading, error, refetch } = citasQuery;

  const { data: citasMesData } = citasQuery.useCitasPorRango(
    barberoActual?.id_sucursal || undefined,
    firstDayOfMonth.toISOString().split('T')[0],
    lastDayOfMonth.toISOString().split('T')[0]
  );
  console.log('🗓️ Datos de citas por rango:', citasMesData);

  // Obtener IDs únicos de clientes de las citas filtradas
  const clienteIds = useMemo(() => {
    if (!citasData) return [];
    return Array.from(
      new Set(
        citasData
          .map((cita: Appointment) => cita.id_cliente)
          .filter((id): id is string => id !== null && id !== undefined)
      )
    );
  }, [citasData]);

  // Obtener información de todos los clientes necesarios
  const { data: clientesData } = useClientesByIds(clienteIds);

  // Crear un mapa de clientes por ID para acceso rápido
  const clientesMap = useMemo(() => {
    if (!clientesData) return {};
    return clientesData.reduce((acc, cliente) => {
      if (cliente.id_cliente) {
        acc[cliente.id_cliente] = cliente;
      }
      return acc;
    }, {} as Record<string, Client>);
  }, [clientesData]);

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
    if (citasMesData) {
      console.log('📋 Citas del mes antes de filtrar:', citasMesData);
      const citasFiltradas = citasMesData.filter((cita: Appointment) => cita.estado !== "cancelado");
      console.log('✅ Citas del mes después de filtrar:', citasFiltradas);
      citasFiltradas.forEach((cita: Appointment) => {
        // Asegurarse de que la fecha esté en el formato correcto (YYYY-MM-DD)
        const fecha = cita.fecha.split('T')[0];
        if (!citasPorFecha[fecha]) {
          citasPorFecha[fecha] = [];
        }
        citasPorFecha[fecha].push(cita);
      });
    }
    console.log('📅 Mapa de citas por fecha:', citasPorFecha);

    while (current <= endDay) {
      // Formatear la fecha actual para comparar con las citas
      const fechaActual = current.toISOString().split('T')[0];
      const citasDelDia = citasPorFecha[fechaActual] || [];

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === today.toDateString(),
        isSelected: current.toDateString() === selectedDate.toDateString(),
        citas: citasDelDia // Agregar las citas del día
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


  return (
    // Contenedor principal que engloba todo el contenido
    <div className="flex flex-col w-full bg-transparent px-1 py-0">
      {/* Título de la agenda - compartido por ambas vistas */}
      <div className="mb-1">
        <h2 className="text-1xl font-bold text-left text-qoder-dark-text-primary">Agenda</h2>
      </div>

      {/* Filtros - compartidos por ambas vistas */}

      {/* Vista de Calendario */}
      {view === 'calendar' && (
        <div className="flex-1 pb-6 overflow-auto">
          {/* Navegación de Mes */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-qoder-dark-bg-secondary transition-colors duration-200"
            >
              <ChevronLeftIcon className="h-5 w-5 text-qoder-dark-text-primary" />
            </button>
            <h2 className="text-lg font-semibold text-qoder-dark-text-primary">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-qoder-dark-bg-secondary transition-colors duration-200"
            >
              <ChevronRightIcon className="h-5 w-5 text-qoder-dark-text-primary" />
            </button>
          </div>

          {/* Encabezados de Día de la Semana */}
          <div className="grid grid-cols-7 gap-0 mb-0">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-orange-500 py-2 bg-transparent"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Cuadrícula del Calendario */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {calendarDays.map((day, index) => {
              // Contar las citas del día
              const citaCount = day.citas ? day.citas.length : 0;

              return (
                <div
                  key={index}
                  className="h-12 flex items-center justify-center bg-transparent"
                >
                  <div
                    onClick={() => handleDaySelect(day)}
                    className={`flex flex-col items-center justify-center text-sm w-full h-full rounded transition-all duration-200 cursor-pointer ${day.isToday ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white' :
                      day.isSelected && !day.isToday ? 'bg-gray-700' : 'bg-transparent'
                      } hover:bg-orange-500 hover:bg-opacity-50 hover:text-white`}
                    style={{
                      opacity: day.isCurrentMonth ? 1 : 0.5,
                      border: '1px solid rgba(75, 85, 99, 0.2)' // Gris con 20% opacidad
                    }}
                  >
                    <span className="font-semibold">{day.date.getDate()}</span>
                    {citaCount > 0 && (
                      <div className="mt-1 flex items-center justify-center">
                        <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                          {citaCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón de Nueva Cita */}
          <div className="mt-auto">
            <button
              onClick={handleNewAppointment}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium"
            >
              + Nuevo Turno
            </button>
          </div>
        </div>
      )}

      {/* Vista de Día */}
      {view === 'day' && (
        <div className="flex flex-col flex-1">
          {/* Botón de volver al calendario y fecha */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setView("calendar")}
              className="text-white text-sm font-medium flex items-center"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Volver
            </button>

            <h2 className="text-lg font-semibold text-qoder-dark-text-primary">
              {formatDate(selectedDate)}
            </h2>
          </div>

          {/* Lista de Citas: contenedor que crece/achica según cantidad */}
          <div className="-mx-4 px-4 flex flex-col gap-3 flex-1">
            {isLoading ? (
              <div className="text-center py-8 text-qoder-dark-text-secondary flex items-center justify-center">
                Cargando citas...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 flex items-center justify-center">
                Error al cargar las citas: {error.message}
              </div>
            ) : citasData && citasData.length > 0 ? (
              <div className="space-y-3 pb-4">
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

                    return (
                      <div
                        key={appointment.id_cita}
                        onClick={() => handleAppointmentClick(appointment)}
                        className="bg-qoder-dark-bg-form rounded-lg p-4 border border-qoder-dark-border cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-qoder-dark-text-primary flex items-center">
                              {appointment.cliente_nombre}
                              {clientData && clientData.puntaje !== null && clientData.puntaje !== undefined && (
                                <span className="ml-2">
                                  {getStarsFromScore(clientData.puntaje)}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-qoder-dark-text-secondary mt-1">
                              {appointment.servicio}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-qoder-dark-text-primary">
                              {appointment.hora.substring(0, 5)}
                            </div>
                            <div className="text-sm text-qoder-dark-text-secondary mt-1">
                              {appointment.duracion} min
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-qoder-dark-text-secondary flex items-center justify-center">
                No hay citas programadas para este día
              </div>
            )}
          </div>

          {/* Botón de Nueva Cita */}
          <div className="mt-2 pb-4">
            <button
              onClick={handleNewAppointment}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium"
            >
              + Nuevo Turno
            </button>
          </div>
        </div>
      )}

      {/* Modal de Cita */}
      <FinalAppointmentModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        initial={selectedAppointment || undefined}
      />
    </div>
  );
}