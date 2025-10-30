"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import type { Appointment } from "@/types/db";
import { toast } from "sonner";
// Importar los estilos personalizados para FullCalendar
import "../app/fullcalendar.css";

function toEvent(a: Appointment) {
  try {
    // Asegurarse de que la fecha y hora estén en el formato correcto
    let start = "";

    // Verificar si la hora ya incluye segundos
    const horaConSegundos =
      a.hora.includes(":") && a.hora.split(":").length === 3;
    const horaFormato = horaConSegundos ? a.hora : `${a.hora}:00`;

    // Formato de fecha para FullCalendar: YYYY-MM-DDTHH:mm:ss
    start = `${a.fecha}T${horaFormato}`;

    // Verificar que la fecha sea válida
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      console.error("Fecha inválida para la cita:", a);
      return null;
    }

    // Calcular la duración en minutos desde el campo duracion
    let durationMinutes = 30; // Valor por defecto
    if (a.duracion) {
      // Extraer solo los números de la duración (ej. "30m" -> 30)
      const durationMatch = a.duracion.match(/(\d+)/);
      if (durationMatch && durationMatch[1]) {
        durationMinutes = parseInt(durationMatch[1], 10);
      }
    }

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    // Verificar que la fecha final sea válida
    if (isNaN(endDate.getTime())) {
      console.error("Fecha final inválida para la cita:", a);
      return null;
    }

    const end = endDate.toISOString();

    console.log("Convirtiendo cita a evento:", {
      cita: a,
      start,
      end,
      durationMinutes,
    });

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
        duracion: a.duracion,
      },
    };
  } catch (error) {
    console.error("Error al convertir cita a evento:", error);
    console.error("Cita problemática:", a);
    return null;
  }
}

// Función para obtener la fecha en la zona horaria de Uruguay
const getUruguayDate = (date: Date = new Date()) => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * -3); // UTC-3 para Uruguay
};

export function Calendar({
  barbero,
  sucursalId,
  initialView = "dayGridMonth",
  onEdit,
  onViewChange,
}: {
  barbero?: number; // ID numérico del barbero
  sucursalId?: string; // ID de la sucursal
  initialView?: string;
  onEdit?: (appointment: Appointment) => void;
  onViewChange?: (view: string) => void;
}) {
  console.log("Props recibidos en Calendar:", {
    barbero,
    sucursalId,
    initialView,
  });

  // Usar barbero directamente como número
  const { data, isLoading, updateMutation, refetch } = useCitas({
    sucursalId,
    fecha: undefined,
    barberoId: barbero ? barbero.toString() : undefined,
  }); // Filtrar por sucursal y barbero

  // Obtener horarios de la sucursal
  const { horarios: horariosSucursal } = useHorariosSucursales(sucursalId);

  console.log("Datos obtenidos de useCitas:", {
    data: data?.length,
    isLoading,
  });
  console.log("Horarios de sucursal:", horariosSucursal);

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
      .filter((horario) => horario.activo)
      .map((horario) => {
        // Ahora JavaScript y la base de datos usan el mismo esquema:
        // 0=Domingo, 1=Lunes, 2=Martes, ..., 6=Sábado
        return horario.id_dia;
      });

    // Encontrar los días que no tienen horarios activos
    const inactiveDays = allDays.filter((day) => !activeDays.includes(day));

    console.log("Días activos:", activeDays);
    console.log("Días inactivos:", inactiveDays);

    return inactiveDays;
  }, [horariosSucursal]);

  // Convertir los datos a eventos sin filtrar adicionalmente por barbero
  // (el filtrado ya se hace en useCitas)
  const filteredEvents = useMemo(() => {
    const events = (data || []).map(toEvent).filter((event) => event !== null);
    console.log("Eventos filtrados:", events.length);
    return events;
  }, [data]);
  const calendarRef = useRef<FullCalendar>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastClick, setLastClick] = useState<{
    id: string;
    time: number;
  } | null>(null);

  // Ref para almacenar los datos actuales
  const currentDataRef = useRef(data);
  currentDataRef.current = data;

  const handleDateClick = (info: { date: Date; allDay: boolean }) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      // Si estamos en vista mensual y hacen doble clic, cambiamos a vista semanal
      if (calendarApi.view.type === "dayGridMonth") {
        calendarApi.changeView("timeGridWeek", info.date);
        onViewChange?.("timeGridWeek");
      }
      // Si estamos en vista semanal y hacen doble clic, cambiamos a vista diaria
      else if (calendarApi.view.type === "timeGridWeek") {
        calendarApi.changeView("timeGridDay", info.date);
        onViewChange?.("timeGridDay");
      }
    }
  };

  const handleEventClick = (info: { event: { id: string } }) => {
    const now = Date.now();
    const clickId = info.event.id;

    // Si hay un timeout pendiente, significa que es un doble clic
    if (
      clickTimeout &&
      lastClick &&
      lastClick.id === clickId &&
      now - lastClick.time < 300
    ) {
      // Cancelar el timeout del primer clic
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      setLastClick(null);

      // Manejar el doble clic
      if (onEdit) {
        const appointment = (currentDataRef.current || []).find(
          (a) => a.id_cita === clickId,
        );
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
          const appointment = (currentDataRef.current || []).find(
            (a) => a.id_cita === clickId,
          );
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
    <div className="qoder-dark-calendar-container bg-qoder-dark-bg-secondary mt-5">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        locale="es"
        // Configurar la fecha actual según la zona horaria de Uruguay
        now={today}
        // Eliminar restricciones de rango de fechas para permitir navegación sin límites
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
        }}
        // Configuración de horarios: 9 AM a 8:30 PM (cambiado de 9 PM a 8:30 PM)
        slotMinTime="09:00:00"
        slotMaxTime="20:30:00"
        // Ocultar días según los horarios de la sucursal
        hiddenDays={hiddenDays}
        // Configuración de semana: domingo a sábado (0 = Domingo)
        firstDay={0}
        editable={true}
        droppable={false}
        eventDurationEditable={true}
        eventStartEditable={true}
        eventResizableFromStart={true}
        events={filteredEvents}
        eventClick={handleEventClick}
        // Agregar manejo de doble clic
        dateClick={handleDateClick}
        eventDrop={async (info) => {
          console.log("📅 ===== EVENT DROP DETECTADO ===== 📅");
          const id_cita = info.event.id;
          const start = info.event.start;
          console.log("📅 Evento arrastrado:", {
            id_cita,
            start,
            evento: info.event,
          });
          if (!start) return;
          const fecha = start.toISOString().slice(0, 10);
          const hora = start.toTimeString().slice(0, 8);
          console.log("📅 Nueva fecha/hora:", { fecha, hora });
          try {
            await updateMutation.mutateAsync({ id_cita, fecha, hora });
            console.log("✅ Cita reprogramada exitosamente");
            toast.success("Cita reprogramada");
          } catch (e: unknown) {
            console.error("❌ Error al reprogramar cita:", e);
            const message =
              e instanceof Error ? e.message : "No se pudo reprogramar";
            toast.error(message);
            info.revert();
          }
        }}
        eventResize={async (info) => {
          console.log("📅 ===== EVENT RESIZE DETECTADO ===== 📅");
          const id_cita = info.event.id;
          const start = info.event.start;
          const end = info.event.end;
          console.log("📅 Evento redimensionado:", {
            id_cita,
            start,
            end,
            evento: info.event,
          });
          if (!start || !end) return;

          // Calcular la nueva duración en minutos
          const durationMs = end.getTime() - start.getTime();
          const durationMinutes = Math.round(durationMs / 60000);
          const duracion = `${durationMinutes}m`;

          console.log("📅 Nueva duración:", { duracion, durationMinutes });
          try {
            await updateMutation.mutateAsync({ id_cita, duracion });
            console.log("✅ Duración de cita actualizada exitosamente");
            toast.success("Duración actualizada");
          } catch (e: unknown) {
            console.error("❌ Error al actualizar duración:", e);
            const message =
              e instanceof Error
                ? e.message
                : "No se pudo actualizar la duración";
            toast.error(message);
            info.revert();
          }
        }}
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
