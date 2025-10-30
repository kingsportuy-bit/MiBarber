import type { Appointment } from "@/types/db";

interface AgendaEventCardProps {
  cita: Appointment & { 
    duracionMinutos?: number | null; 
    slotsOcupados?: number 
  };
  onEdit: (appointment: Appointment) => void;
  alturaCalculada: number;
}

export function AgendaEventCard({ 
  cita, 
  onEdit,
  alturaCalculada
}: AgendaEventCardProps) {
  // Calcular si es hora de almuerzo (solo para visualización)
  const esHoraAlmuerzo = false; // Esta lógica se maneja en el componente padre

  return (
    <div 
      key={cita.id_cita} 
      className="qoder-dark-card p-2 hover-lift smooth-transition cursor-pointer overflow-hidden md:p-3"
      onClick={() => onEdit(cita)}
      style={{ 
        height: `${alturaCalculada}px`,
        minHeight: `${alturaCalculada}px`,
        marginBottom: '8px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-qoder-dark-text-primary text-sm truncate md:text-base">
            {cita.cliente_nombre}
          </h4>
          {cita.nota && (
            <p className="text-xs text-qoder-dark-text-muted italic truncate mt-1">
              {cita.nota}
            </p>
          )}
        </div>
        <span className="text-sm font-bold text-qoder-dark-accent-primary bg-qoder-dark-bg-primary/20 px-1 py-0.5 rounded ml-1 flex-shrink-0 md:text-base md:px-2 md:py-1">
          ${cita.ticket || 0}
        </span>
      </div>
      
      {/* Para citas más cortas, usar layout horizontal */}
      {alturaCalculada <= 64 ? (
        <div className="flex flex-wrap gap-1 md:gap-2">
          <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium truncate">{cita.hora.slice(0, 5)}</span>
          </div>
          
          <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium truncate">{cita.barbero}</span>
          </div>
          
          <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8v8m0-8h8M8 8H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2M8 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
            </svg>
            <span className="font-medium truncate">{cita.servicio}</span>
          </div>
          
          {'duracionMinutos' in cita && cita.duracionMinutos !== null && cita.duracionMinutos !== undefined && (
            <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{cita.duracionMinutos} min</span>
            </div>
          )}
        </div>
      ) : (
        // Para citas más largas, mantener el layout de grid
        <div className="grid grid-cols-2 gap-1 md:gap-2">
          <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium truncate">{cita.hora.slice(0, 5)}</span>
          </div>
          
          <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium truncate">{cita.barbero}</span>
          </div>
          
          <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8v8m0-8h8M8 8H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2M8 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
            </svg>
            <span className="font-medium truncate">{cita.servicio}</span>
          </div>
          
          {'duracionMinutos' in cita && cita.duracionMinutos !== null && cita.duracionMinutos !== undefined && (
            <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{cita.duracionMinutos} min</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}