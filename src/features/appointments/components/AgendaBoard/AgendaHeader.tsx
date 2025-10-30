import { useAgendaLogic } from "./hooks/useAgendaLogic";

interface AgendaHeaderProps {
  onNewAppointment?: () => void;
  formatDate: (date: Date) => string;
  canGoToPreviousDay: boolean;
  canGoToNextDay: boolean;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  currentDate: Date;
}

export function AgendaHeader({
  onNewAppointment,
  formatDate,
  canGoToPreviousDay,
  canGoToNextDay,
  goToPreviousDay,
  goToNextDay,
  goToToday,
  currentDate
}: AgendaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-qoder-dark-text-primary">
          Agenda
        </h1>
        <span className="text-qoder-dark-text-secondary">
          {formatDate(currentDate)}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousDay}
            disabled={!canGoToPreviousDay}
            className={`p-2 rounded-lg transition-colors ${
              canGoToPreviousDay 
                ? "hover:bg-qoder-dark-bg-primary text-qoder-dark-text-primary" 
                : "text-qoder-dark-text-muted cursor-not-allowed"
            }`}
            aria-label="Día anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-qoder-dark-bg-primary hover:bg-qoder-dark-accent-primary/10 text-qoder-dark-text-primary transition-colors"
          >
            Hoy
          </button>
          
          <button
            onClick={goToNextDay}
            disabled={!canGoToNextDay}
            className={`p-2 rounded-lg transition-colors ${
              canGoToNextDay 
                ? "hover:bg-qoder-dark-bg-primary text-qoder-dark-text-primary" 
                : "text-qoder-dark-text-muted cursor-not-allowed"
            }`}
            aria-label="Día siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {onNewAppointment && (
          <button
            onClick={onNewAppointment}
            className="ml-4 px-4 py-2 bg-qoder-dark-accent-primary hover:bg-qoder-dark-accent-primary/90 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nueva Cita
          </button>
        )}
      </div>
    </div>
  );
}