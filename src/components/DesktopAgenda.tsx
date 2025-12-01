"use client";

import { useState, useEffect } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { SingleFormAppointmentModalWithSucursal } from "@/components/SingleFormAppointmentModalWithSucursal";
import type { Appointment } from "@/types/db";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";
import { FloatingNewAppointmentButton } from "@/components/FloatingNewAppointmentButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { CalendarWithBloqueos } from "@/components/CalendarWithBloqueos";
import { useCliente, useClientesByIds } from "@/hooks/useClientes";
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
  const { filters, setFilters, sucursales, barberos, isLoadingSucursales, isLoadingBarberos, isAdmin, barbero } = useGlobalFilters();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [view, setView] = useState<'calendar' | 'day'>('calendar'); // calendar or day view

  // Filter barbers by selected branch
  const filteredBarbers = filters.sucursalId 
    ? barberos?.filter((b: any) => b.id_sucursal === filters.sucursalId)
    : barberos;

  // Calcular el primer y último día del mes para obtener todas las citas del mes
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const citasQuery = useCitas({
    sucursalId: filters.sucursalId || undefined,
    barberoId: filters.barberoId || undefined,
  });
  
  const { data: citasData, isLoading, error, refetch } = citasQuery;
  
  // Obtener citas para todo el mes usando el rango
  const { data: citasMesData } = citasQuery.useCitasPorRango(
    filters.sucursalId || undefined,
    firstDayOfMonth.toISOString().split('T')[0],
    lastDayOfMonth.toISOString().split('T')[0]
  );

  // Handle branch change
  const handleSucursalChange = (value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      sucursalId: value || null,
      barberoId: null // Reset barber when branch changes
    }));
  };

  // Handle barber change
  const handleBarberoChange = (value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      barberoId: value || null
    }));
  };

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
      citasMesData
        .filter(cita => cita.estado !== "cancelado") // Filtrar citas canceladas
        .forEach(cita => {
        // Asegurarse de que la fecha esté en el formato correcto (YYYY-MM-DD)
        const fechaParts = cita.fecha.split('T');
        const fechaStr = fechaParts[0];
        
        if (!citasPorFecha[fechaStr]) {
          citasPorFecha[fechaStr] = [];
        }
        citasPorFecha[fechaStr].push(cita);
      });
    }
    
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

  // Effect to refetch when filters change
  useEffect(() => {
    refetch();
  }, [filters.sucursalId, filters.barberoId, selectedDate, refetch]);
  
  // Obtener IDs únicos de clientes de las citas del mes
  const clienteIds = citasMesData 
    ? Array.from(new Set(citasMesData
        .filter(cita => {
          // Filtrar solo las citas del día seleccionado para obtener los IDs
          const citaFecha = cita.fecha.split('T')[0];
          const selectedFecha = selectedDate.toISOString().split('T')[0];
          return citaFecha === selectedFecha;
        })
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
      
      
      {/* Filtros - compartidos por ambas vistas */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-6 items-end">
          {/* Filtro de Sucursal */}
          <div className="flex-1 min-w-[250px] max-w-[300px]">
            <label className="block text-sm font-medium text-qoder-dark-text-primary mb-2">
              Sucursal
            </label>
            <select
              value={filters.sucursalId || ""}
              onChange={(e) => handleSucursalChange(e.target.value || undefined)}
              className="qoder-dark-input w-full py-3 px-4 text-base rounded-lg"
              disabled={isLoadingSucursales}
            >
              {isLoadingSucursales ? (
                <option>Cargando sucursales...</option>
              ) : (
                <>
                  <option value="">Todas las sucursales</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          
          {/* Filtro de Barbero */}
          <div className="flex-1 min-w-[250px] max-w-[300px]">
            <label className="block text-sm font-medium text-qoder-dark-text-primary mb-2">
              Barbero
            </label>
            <select
              value={filters.barberoId || ""}
              onChange={(e) => handleBarberoChange(e.target.value || undefined)}
              className="qoder-dark-input w-full py-3 px-4 text-base rounded-lg"
              disabled={isLoadingBarberos}
            >
              {isLoadingBarberos ? (
                <option>Cargando barberos...</option>
              ) : (
                <>
                  <option value="">Todos los barberos</option>
                  {filteredBarbers?.map((barbero: any) => (
                    <option key={barbero.id_barbero} value={barbero.id_barbero}>
                      {barbero.nombre}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          
          {/* Botón de Nuevo Turno alineado a la derecha */}
          <div className="ml-auto">
            <button
              onClick={handleNewAppointment}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 whitespace-nowrap"
            >
              + Nuevo Turno
            </button>
          </div>
        </div>
      </div>
      
      {/* Vista de Calendario */}
      {view === 'calendar' && (
        <div className="flex-1 pb-8">
          {/* Navegación de Mes */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={goToPreviousMonth}
              className="p-3 rounded-full hover:bg-qoder-dark-bg-secondary transition-colors duration-200"
            >
              <ChevronLeftIcon className="h-6 w-6 text-qoder-dark-text-primary" />
            </button>
            <h2 className="text-xl font-semibold text-qoder-dark-text-primary">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <button 
              onClick={goToNextMonth}
              className="p-3 rounded-full hover:bg-qoder-dark-bg-secondary transition-colors duration-200"
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
                    className={`flex flex-col items-center justify-center text-base w-full h-full rounded transition-all duration-200 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg ${
                      day.isToday ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white' : 
                      day.isSelected && !day.isToday ? 'bg-gray-700' : 'bg-transparent'
                    } hover:bg-orange-500 hover:bg-opacity-50 hover:text-white`}
                    style={{
                      opacity: day.isCurrentMonth ? 1 : 0.5,
                      border: '1px solid rgba(75, 85, 99, 0.2)' // Gris con 20% opacidad
                    }}
                  >
                    <span className="text-lg font-semibold">{day.date.getDate()}</span>
                    {citaCount > 0 && (
                      <div className="mt-1 flex items-center justify-center">
                        <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
      )}
      
      {/* Vista de Día */}
      {view === 'day' && (
        <div className="flex flex-col flex-1">
          {/* Botón de volver al calendario y fecha */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setView("calendar")}
              className="text-white text-base font-medium flex items-center bg-qoder-dark-button-secondary hover:bg-qoder-dark-button-secondary-hover py-2 px-4 rounded-lg transition-colors duration-200"
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
                Error al cargar las citas: {error.message}
              </div>
            ) : citasMesData && citasMesData.length > 0 ? (
              <div className="space-y-4 pb-6">
                {citasMesData
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
                        className="bg-qoder-dark-bg-form rounded-xl p-5 border border-qoder-dark-border cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-qoder-dark-text-primary text-lg">
                              {appointment.cliente_nombre}
                              {clientData && clientData.puntaje !== null && clientData.puntaje !== undefined && (
                                <span className="ml-2">
                                  {getStarsFromScore(clientData.puntaje)}
                                </span>
                              )}
                            </div>
                            <div className="text-base text-qoder-dark-text-secondary mt-2">
                              {appointment.servicio}
                            </div>
                            {/* Mostrar notas de forma sutil si existen */}
                            {appointment.nota && (
                              <div className="mt-2 text-sm text-qoder-dark-text-muted italic truncate max-w-xs">
                                {appointment.nota}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-qoder-dark-text-primary text-lg">
                              {appointment.hora.substring(0, 5)} {/* Formato HH:MM */}
                            </div>
                            <div className="text-base text-qoder-dark-text-secondary mt-2">
                              {appointment.duracion} min {/* Agregar "min" a la duración */}
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
      )}
      
      {/* Modal de Cita */}
      <SingleFormAppointmentModalWithSucursal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        initial={selectedAppointment || undefined}
      />
    </div>
  );
}