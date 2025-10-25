"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import type { Appointment } from "@/types/db";
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

// Función para obtener la fecha en la zona horaria de Uruguay
const getUruguayDate = (date: Date = new Date()) => {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * -3)); // UTC-3 para Uruguay
};

export function SimpleCalendar({ 
  barbero, 
  sucursalId,
  initialView = "dayGridMonth",
  onEdit,
  onViewChange,
  onDateSelect
}: { 
  barbero?: string; // ID del barbero como string
  sucursalId?: string; // ID de la sucursal
  initialView?: string;
  onEdit?: (appointment: Appointment) => void;
  onViewChange?: (view: string) => void;
  onDateSelect?: (date: Date) => void;
}) {
  console.log("Props recibidos en SimpleCalendar:", { barbero, sucursalId, initialView });
  
  // Usar barbero directamente como string
  const { data, isLoading, updateMutation, refetch } = useCitas(sucursalId, undefined, barbero); // Filtrar por sucursal y barbero
  
  // Obtener horarios de la sucursal
  const { horarios: horariosSucursal } = useHorariosSucursales(sucursalId); // Añadir esta línea
  
  console.log("Datos obtenidos de useCitas:", { data: data?.length, isLoading });
  console.log("Horarios de sucursal:", horariosSucursal); // Añadir esta línea
  
  // Efecto para refetch cuando cambian las props
  useEffect(() => {
    refetch();
  }, [sucursalId, barbero, refetch]);
  
  // Determinar qué días deben estar ocultos basados en los horarios de la sucursal
  const hiddenDays = useMemo(() => {
    if (!horariosSucursal || horariosSucursal.length === 0) {
      // Si no hay horarios definidos, mostrar todos los días
      return [];
    }
    
    // Crear un array con todos los días de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    
    // Encontrar los días que tienen horarios activos
    const activeDays = horariosSucursal
      .filter(horario => horario.activo)
      .map(horario => {
        // Ahora JavaScript y la base de datos usan el mismo esquema:
        // 0=Domingo, 1=Lunes, 2=Martes, ..., 6=Sábado
        return horario.id_dia;
      });
    
    // Encontrar los días que no tienen horarios activos
    const inactiveDays = allDays.filter(day => !activeDays.includes(day));
    
    console.log("Días activos:", activeDays);
    console.log("Días inactivos:", inactiveDays);
    
    return inactiveDays;
  }, [horariosSucursal]);
  
  // Convertir los datos a eventos sin filtrar adicionalmente por barbero
  // (el filtrado ya se hace en useCitas)
  const filteredEvents = useMemo(() => {
    const events = (data || []).map(toEvent).filter(event => event !== null);
    console.log("Eventos filtrados para FullCalendar:", events.length);
    return events;
  }, [data]);

  const calendarRef = useRef<FullCalendar>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastClick, setLastClick] = useState<{ id: string; time: number } | null>(null);

  // Ref para almacenar los datos actuales
  const currentDataRef = useRef(data);
  currentDataRef.current = data;

  const handleDateClick = (info: { date: Date, allDay: boolean }) => {
    console.log("Clic en fecha:", info.date);
    // Si se proporciona onDateSelect, llamar a esa función
    if (onDateSelect) {
      onDateSelect(info.date);
    }
    // Si se proporciona onEdit, mantener la funcionalidad original
    else if (onEdit) {
      // No hacer nada al hacer clic en una fecha ya que la vista diaria ha sido eliminada
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
      filteredEvents.forEach(event => {
        calendarApi.addEvent(event);
      });
      
      console.log("Eventos actualizados en calendario:", filteredEvents.length);
    }
  }, [filteredEvents]);
  
  // Efecto para manejar cambios de vista
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && initialView) {
      console.log("Cambiando vista inicial a:", initialView);
      calendarApi.changeView(initialView);
    }
  }, [initialView]);
  
  const handleEventClick = (info: { event: { id: string } }) => {
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

  return (
    <div className="bg-qoder-dark-bg-form rounded-lg p-2 md:p-4 border border-qoder-dark-border">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={initialView}
        locale="es"
        // Configurar la fecha actual según la zona horaria de Uruguay
        now={today}
        // Simplificar la barra de herramientas - responsive
        headerToolbar={{ 
          left: "prev,next", 
          center: "title", 
          right: "" 
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes"
        }}
        // Configuración de horarios: 9 AM a 8:30 PM
        slotMinTime="09:00:00"
        slotMaxTime="20:30:00"
        // Ocultar días según los horarios de la sucursal
        hiddenDays={hiddenDays}
        // Configuración de semana: domingo a sábado (0 = Domingo)
        firstDay={0}
        editable={false}
        droppable={false}
        events={filteredEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
        // Configuraciones adicionales para mejorar la apariencia tipo tablero
        dayMaxEvents={true}
        weekends={true}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        // Eliminar la sección "all day"
        allDaySlot={false}
        // Limitar el calendario a 5 filas máximo
        fixedWeekCount={false}
        // Desactivar navegación por días
        navLinks={false}
        // No mostrar números de semana
        weekNumbers={false}
        // Mejorar la visualización de eventos
        eventDisplay="block"
        // Estilos personalizados para que coincida con qoder-dark-input
        contentHeight="auto"
        // Hacer responsive el calendario
        windowResizeDelay={100}
        handleWindowResize={true}
      />
    </div>
  );
}