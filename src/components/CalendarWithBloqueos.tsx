// Componente de calendario que muestra bloqueos
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { useBloqueosPorDia } from "@/hooks/useBloqueosBarbero";
import type { Appointment } from "@/types/db";
import type { Bloqueo } from "@/types/bloqueos";
// Importar los estilos personalizados para FullCalendar
import "../app/fullcalendar.css";

function toEvent(a: Appointment) {
  try {
    // Asegurarse de que la fecha y hora estén en el formato correcto
    let start = "";
    
    // Verificar si la hora ya incluye segundos
    const horaConSegundos = a.hora.includes(':') && a.hora.split(':').length === 3;
    const horaFormato = horaConSegundos ? a.hora : `${a.hora}:00`;
    
    // Formato de fecha para FullCalendar: YYYY-MM-DDTHH:mm:ss
    start = `${a.fecha}T${horaFormato}`;
    
    // Verificar que la fecha sea válida
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      console.error("Fecha inválida para la cita:", a);
      return null;
    }
    
    const durationMinutes = parseInt(a.duracion?.replace(/\D/g, "") || "30", 10);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    // Verificar que la fecha final sea válida
    if (isNaN(endDate.getTime())) {
      console.error("Fecha final inválida para la cita:", a);
      return null;
    }
    
    const end = endDate.toISOString();
    
    return {
      id: a.id_cita,
      title: `${a.cliente_nombre} · ${a.servicio}`,
      start,
      end,
      // Agregar propiedades adicionales para una mejor visualización
      extendedProps: {
        cliente: a.cliente_nombre,
        servicio: a.servicio,
        barbero: a.barbero,
        ticket: a.ticket,
        duracion: a.duracion
      }
    };
  } catch (error) {
    console.error("Error al convertir cita a evento:", error);
    console.error("Cita problemática:", a);
    return null;
  }
}

// Función para convertir bloqueos a eventos de FullCalendar
function bloqueoToEvent(bloqueo: Bloqueo) {
  try {
    if (bloqueo.tipo === 'bloqueo_dia') {
      // Bloqueo de día completo
      const start = `${bloqueo.fecha}T00:00:00`;
      const end = `${bloqueo.fecha}T23:59:59`;
      
      return {
        id: `bloqueo-${bloqueo.id}`,
        title: bloqueo.motivo || 'Bloqueo de día completo',
        start,
        end,
        allDay: true,
        backgroundColor: '#ef4444', // rojo
        borderColor: '#ef4444',
        textColor: '#ffffff',
        classNames: ['bloqueo-event', 'bloqueo-dia'],
        extendedProps: {
          tipo: 'bloqueo_dia',
          motivo: bloqueo.motivo
        }
      };
    } else {
      // Bloqueo de horas o descanso
      if (!bloqueo.hora_inicio || !bloqueo.hora_fin) {
        return null;
      }
      
      const start = `${bloqueo.fecha}T${bloqueo.hora_inicio}:00`;
      const end = `${bloqueo.fecha}T${bloqueo.hora_fin}:00`;
      
      const isDescanso = bloqueo.tipo === 'descanso';
      
      return {
        id: `bloqueo-${bloqueo.id}`,
        title: bloqueo.motivo || (isDescanso ? 'Descanso' : 'Bloqueo de horas'),
        start,
        end,
        allDay: false,
        backgroundColor: isDescanso ? '#3b82f6' : '#f59e0b', // azul para descanso, amarillo para bloqueo
        borderColor: isDescanso ? '#3b82f6' : '#f59e0b',
        textColor: '#ffffff',
        classNames: ['bloqueo-event', isDescanso ? 'descanso' : 'bloqueo-horas'],
        extendedProps: {
          tipo: bloqueo.tipo,
          motivo: bloqueo.motivo
        }
      };
    }
  } catch (error) {
    console.error("Error al convertir bloqueo a evento:", error);
    console.error("Bloqueo problemático:", bloqueo);
    return null;
  }
}

// Función para obtener la fecha en la zona horaria de Uruguay
const getUruguayDate = (date: Date = new Date()) => {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * -3)); // UTC-3 para Uruguay
};

export function CalendarWithBloqueos({ 
  barbero, 
  sucursalId,
  initialView = "timeGridDay",
  onEdit,
  onViewChange,
  onDateSelect
}: { 
  barbero?: string;
  sucursalId?: string;
  initialView?: string;
  onEdit?: (appointment: Appointment) => void;
  onViewChange?: (view: string) => void;
  onDateSelect?: (date: Date) => void;
}) {
  console.log("Props recibidos en CalendarWithBloqueos:", { barbero, sucursalId, initialView });
  
  console.log('📅 CalendarWithBloqueos - Parámetros recibidos:', { sucursalId, barbero });
  
  // Usar barbero directamente como string
  const { data, isLoading, updateMutation, refetch } = useCitas({
    sucursalId,
    barberoId: barbero
  });
  
  console.log('📅 CalendarWithBloqueos - Datos obtenidos:', { data: data?.length, isLoading });
  
  // Obtener horarios de la sucursal
  const { horarios: horariosSucursal } = useHorariosSucursales(sucursalId);
  
  // Obtener bloqueos para la fecha actual
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const { data: bloqueos } = useBloqueosPorDia({
    idSucursal: sucursalId || '',
    idBarbero: barbero,
    fecha: currentDate.toISOString().split('T')[0]
  });
  
  console.log("Datos obtenidos de useCitas:", { data: data?.length, isLoading });
  console.log("Horarios de sucursal:", horariosSucursal);
  console.log("Bloqueos:", bloqueos);
  
  // Efecto para refetch cuando cambian las props
  useEffect(() => {
    refetch();
  }, [sucursalId, barbero, refetch]);
  
  // Determinar qué días deben estar ocultos basados en los horarios de la sucursal y bloqueos
  const hiddenDays = useMemo(() => {
    // Comenzar con los días inactivos de la sucursal
    let inactiveDays: number[] = [];
    
    if (horariosSucursal && horariosSucursal.length > 0) {
      // Crear un array con todos los días de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
      const allDays = [0, 1, 2, 3, 4, 5, 6];
      
      // Encontrar los días que tienen horarios activos
      const activeDays = horariosSucursal
        .filter(horario => horario.activo)
        .map(horario => horario.id_dia);
      
      // Encontrar los días que no tienen horarios activos
      inactiveDays = allDays.filter(day => !activeDays.includes(day));
    }
    
    // Si hay bloqueos de día completo, también ocultar esos días
    // Por ahora, solo ocultamos el día actual si está bloqueado
    // En el futuro, podríamos ocultar todos los días bloqueados
    
    console.log("Días inactivos:", inactiveDays);
    
    return inactiveDays;
  }, [horariosSucursal]);
  
  // Convertir los datos a eventos combinando citas y bloqueos
  const allEvents = useMemo(() => {
    // Convertir citas a eventos
    const citaEvents = (data || []).map(toEvent).filter((event: any) => event !== null);
    
    // Convertir bloqueos a eventos
    const bloqueoEvents = (bloqueos || []).map(bloqueoToEvent).filter((event: any) => event !== null);
    
    // Combinar todos los eventos
    const events = [...citaEvents, ...bloqueoEvents];
    console.log("Eventos combinados para FullCalendar:", events.length);
    return events;
  }, [data, bloqueos]);

  const calendarRef = useRef<FullCalendar>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastClick, setLastClick] = useState<{ id: string; time: number } | null>(null);

  // Ref para almacenar los datos actuales
  const currentDataRef = useRef(data);
  currentDataRef.current = data;

  // Obtener horarios dinámicos para un día específico
  const getDynamicHours = useCallback((date: Date) => {
    if (!horariosSucursal || horariosSucursal.length === 0) {
      // Valores por defecto si no hay horarios
      return { minTime: "09:00:00", maxTime: "20:30:00", lunchBreaks: [] };
    }
    
    // Obtener el día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
    const dayOfWeek = date.getDay();
    
    // Buscar el horario para ese día
    const horario = horariosSucursal.find(h => h.id_dia === dayOfWeek && h.activo);
    
    if (!horario) {
      // Si no hay horario para ese día, usar valores por defecto
      return { minTime: "09:00:00", maxTime: "20:30:00", lunchBreaks: [] };
    }
    
    // Convertir horas a formato HH:MM:SS
    const minTime = `${horario.hora_apertura}:00`;
    const maxTime = `${horario.hora_cierre}:00`;
    
    // Manejar horas de almuerzo
    const lunchBreaks = [];
    if (horario.hora_inicio_almuerzo && horario.hora_fin_almuerzo) {
      lunchBreaks.push({
        start: `${horario.hora_inicio_almuerzo}:00`,
        end: `${horario.hora_fin_almuerzo}:00`
      });
    }
    
    return { minTime, maxTime, lunchBreaks };
  }, [horariosSucursal]);
  
  const handleDateClick = (info: { date: Date, allDay: boolean }) => {
    console.log("Clic en fecha:", info.date);
    // Actualizar la fecha actual para cargar los bloqueos correspondientes
    setCurrentDate(info.date);
    
    // Si se proporciona onDateSelect, llamar a esa función
    if (onDateSelect) {
      onDateSelect(info.date);
    }
    // Si se proporciona onEdit, mantener la funcionalidad original
    else if (onEdit) {
      // Cambiar a la vista de día cuando se hace clic en una fecha
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        const currentView = calendarApi.view.type;
        
        // Si estamos en la vista mensual, cambiar a la vista diaria
        if (currentView === 'dayGridMonth') {
          calendarApi.changeView('timeGridDay', info.date);
          
          // Actualizar las horas dinámicas para ese día
          const { minTime, maxTime, lunchBreaks } = getDynamicHours(info.date);
          calendarApi.setOption('slotMinTime', minTime);
          calendarApi.setOption('slotMaxTime', maxTime);
        }
      }
      console.log("Clic en fecha (sin onDateSelect):", info.date);
    }
  };
  
  // Efecto para forzar la actualización de eventos en el calendario
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      console.log("Forzando actualización de eventos en calendario");
      // Remover todos los eventos existentes
      const existingEvents = calendarApi.getEvents();
      existingEvents.forEach(event => event.remove());
      
      // Agregar los nuevos eventos
      allEvents.forEach(event => {
        calendarApi.addEvent(event);
      });
      
      console.log("Eventos actualizados en calendario:", allEvents.length);
    }
  }, [allEvents]);
  
  // Efecto para manejar cambios de vista
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && initialView) {
      console.log("Cambiando vista inicial a:", initialView);
      calendarApi.changeView(initialView);
    }
  }, [initialView]);
  
  const handleEventClick = (info: { event: { id: string, extendedProps: { tipo?: string } } }) => {
    // Si es un bloqueo, no permitir edición
    if (info.event.extendedProps.tipo && info.event.extendedProps.tipo.startsWith('bloqueo')) {
      // Mostrar mensaje de que no se puede editar un bloqueo
      alert('No se puede editar un bloqueo desde el calendario. Utilice el panel de gestión de bloqueos.');
      return;
    }
    
    const now = Date.now();
    const clickId = info.event.id;
    
    // Si hay un timeout pendiente, significa que es un doble clic
    if (clickTimeout && lastClick && lastClick.id === clickId && (now - lastClick.time) < 300) {
      // Cancelar el timeout del primer clic
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      setLastClick(null);
      
      // Manejar el doble clic
      if (onEdit) {
        const appointment = (currentDataRef.current || []).find(a => a.id_cita === clickId);
        if (appointment) {
          console.log("Enviando datos de cita para editar:", appointment);
          onEdit(appointment);
        }
      }
    } else {
      // Es un clic simple, establecer un timeout
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
      
      const timeout = setTimeout(() => {
        // Manejar el clic simple si es necesario
        if (onEdit) {
          const appointment = (currentDataRef.current || []).find(a => a.id_cita === clickId);
          if (appointment) {
            onEdit(appointment);
          }
        }
        setClickTimeout(null);
        setLastClick(null);
      }, 300);
      
      setClickTimeout(timeout);
      setLastClick({ id: clickId, time: now });
    }
  };

  // Calcular las fechas para limitar el rango del calendario
  const today = getUruguayDate();
  
  // Verificar si la fecha actual está bloqueada
  const isCurrentDateBlocked = useMemo(() => {
    if (!bloqueos || bloqueos.length === 0) return false;
    
    // Verificar si hay un bloqueo de día completo
    return bloqueos.some((bloqueo: any) => bloqueo.tipo === 'bloqueo_dia');
  }, [bloqueos]);

  return (
    <div className="bg-qoder-dark-bg-form rounded-lg p-2 md:p-4 border border-qoder-dark-border">
      {/* Mostrar mensaje si la fecha actual está bloqueada */}
      {isCurrentDateBlocked && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-500 font-medium">
              Esta fecha está bloqueada. No se pueden crear citas.
            </span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        :global(.fc .fc-toolbar-chunk .fc-button-group .fc-button:not(:last-child)) {
          margin-right: 5px;
        }
        
        :global(.fc .fc-toolbar-chunk .fc-button) {
          font-size: 14px !important;
          padding: 6px 12px !important;
          min-width: 60px !important;
          height: 36px !important;
          box-sizing: border-box !important;
        }
        
        /* Estilos para eventos de bloqueo */
        :global(.bloqueo-event) {
          opacity: 0.8;
          cursor: not-allowed !important;
        }
        
        :global(.bloqueo-dia) {
          background-color: #ef4444 !important;
          border-color: #ef4444 !important;
        }
        
        :global(.descanso) {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        
        :global(.bloqueo-horas) {
          background-color: #f59e0b !important;
          border-color: #f59e0b !important;
        }
        
        /* Eliminar estilos responsivos para mantener tamaño fijo */
        @media (max-width: 768px) {
          :global(.fc .fc-toolbar-chunk .fc-button) {
            font-size: 14px !important;
            padding: 6px 12px !important;
            min-width: 60px !important;
            height: 36px !important;
          }
        }
      `}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        locale="es"
        // Configurar la fecha actual según la zona horaria de Uruguay
        now={today}
        // Simplificar la barra de herramientas - responsive
        headerToolbar={{ 
          left: "prev today next", 
          center: "title", 
          right: "dayGridMonth,timeGridDay"
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          day: "Día"
        }}
        // Configuración de horarios dinámicos: 9 AM a 8:30 PM (valores por defecto)
        slotMinTime="09:00:00"
        slotMaxTime="20:30:00"
        // Ocultar días según los horarios de la sucursal
        hiddenDays={hiddenDays}
        // Configuración de semana: domingo a sábado (0 = Domingo)
        firstDay={0}
        editable={false}
        droppable={false}
        events={allEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
        // Configuraciones adicionales para mejorar la apariencia tipo tablero
        dayMaxEvents={true}
        weekends={true}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        // Eliminar la sección "all day"
        allDaySlot={false}
        // Limitar el calendario a 5 filas máximo
        fixedWeekCount={false}
        // Configuración adicional para vistas más interactivas
        navLinks={true} // Activar navegación por días
        weekNumbers={true} // Mostrar números de semana
        weekNumberCalculation="ISO" // Cálculo de números de semana según ISO
        // Mejorar la visualización de eventos
        eventDisplay="block"
        // Configuración para vistas personalizadas
        views={{
          timeGridWeek: {
            slotLabelFormat: {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            },
            dayHeaderFormat: {
              weekday: "long",
              day: "numeric",
              month: "short",
            },
          },
          timeGridDay: {
            slotLabelFormat: {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            },
            dayHeaderFormat: { weekday: "long", day: "numeric", month: "long" },
          },
        }}
      />
    </div>
  );
}

export default CalendarWithBloqueos;
