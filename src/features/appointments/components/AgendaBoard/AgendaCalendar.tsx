import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Appointment } from '@/types/db';

interface AgendaCalendarProps {
  events: any[];
  onEventClick: (info: any) => void;
  onDateClick: (info: any) => void;
  onEventDrop: (info: any) => void;
  currentView: string;
  currentDate: Date;
}

export function AgendaCalendar({
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
  currentView,
  currentDate
}: AgendaCalendarProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView={currentView}
      initialDate={currentDate}
      events={events}
      eventClick={onEventClick}
      dateClick={onDateClick}
      eventDrop={onEventDrop}
      editable={true}
      droppable={true}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      locale="es"
      buttonText={{
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día'
      }}
      allDaySlot={false}
      slotMinTime="09:00:00"
      slotMaxTime="20:30:00"
      firstDay={1} // Lunes como primer día de la semana
      weekends={true}
      eventTimeFormat={{
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }}
      dayHeaderFormat={{
        weekday: 'short',
        month: 'numeric',
        day: 'numeric'
      }}
      height="auto"
      contentHeight="auto"
    />
  );
}