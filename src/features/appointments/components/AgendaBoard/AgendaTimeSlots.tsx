import { useMemo } from "react";
import type { Appointment } from "@/types/db";
import { AgendaEventCard } from "./AgendaEventCard";

interface AgendaTimeSlotsProps {
  timeSlots: string[];
  citasPorHora: Record<string, (Appointment & { duracionMinutos?: number | null; slotsOcupados?: number })[]>;
  mapaOcupacion: Record<string, boolean>;
  isLunchTime: (time: string) => boolean;
  horarioDelDia: any;
  onEdit: (appointment: Appointment) => void;
  getPosicionVertical: (hora: string) => number;
}

export function AgendaTimeSlots({
  timeSlots,
  citasPorHora,
  mapaOcupacion,
  isLunchTime,
  horarioDelDia,
  onEdit,
  getPosicionVertical
}: AgendaTimeSlotsProps) {
  // Calcular la altura total del contenedor basado en los slots
  const containerHeight = useMemo(() => {
    if (!horarioDelDia) return 0;
    
    const [horaApertura, minutoApertura] = horarioDelDia.hora_apertura.split(':').map(Number);
    const [horaCierre, minutoCierre] = horarioDelDia.hora_cierre.split(':').map(Number);
    
    // Calcular minutos totales
    const minutosApertura = horaApertura * 60 + minutoApertura;
    const minutosCierre = horaCierre * 60 + minutoCierre;
    const minutosTotales = minutosCierre - minutosApertura;
    
    // 64px por cada 30 minutos (altura base según la memoria)
    return (minutosTotales / 30) * 64;
  }, [horarioDelDia]);

  console.log("AgendaTimeSlots - Props recibidas:", {
    timeSlots,
    citasPorHora,
    mapaOcupacion,
    horarioDelDia
  });

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-6 md:py-8">
        <p className="text-qoder-dark-text-secondary text-sm md:text-base">
          No hay horario configurado para este día
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        className="relative border-l border-qoder-dark-border-primary pl-4 md:pl-6"
        style={{ height: `${containerHeight}px` }}
      >
        {timeSlots.map((time) => {
          // Verificar si este slot está ocupado por una cita que se extiende
          const isOccupied = mapaOcupacion[time];
          
          // Verificar si es hora de almuerzo
          const esHoraAlmuerzo = isLunchTime(time);
          
          // Obtener citas para esta hora
          const citasEnHora = citasPorHora[time] || [];
          
          // Calcular posición vertical
          const posicionVertical = getPosicionVertical(time);
          
          // Si está ocupado por una cita extendida, no mostrar nada
          if (isOccupied && citasEnHora.length === 0) return null;
          
          console.log(`Renderizando slot ${time}:`, { 
            isOccupied, 
            esHoraAlmuerzo, 
            citasEnHora: citasEnHora.length 
          });
          
          return (
            <div 
              key={time} 
              className="absolute w-full flex items-start"
              style={{ 
                top: `${posicionVertical}px`
              }}
            >
              <div className="flex items-center h-16 md:h-20 w-16 md:w-20 flex-shrink-0">
                <span className="text-qoder-dark-text-secondary text-sm md:text-base font-medium">
                  {time}
                </span>
              </div>
              
              <div className="flex-1 ml-3 md:ml-4">
                {esHoraAlmuerzo ? (
                  <div className="flex items-center justify-center h-12 md:h-16">
                    <span className="text-qoder-dark-text-muted text-xs md:text-sm">
                      Horario de almuerzo
                    </span>
                  </div>
                ) : citasEnHora.length > 0 ? (
                  <div className="space-y-2">
                    {citasEnHora.map((cita) => {
                      // Calcular cuántos slots ocupa la cita
                      const slotsOcupados = cita.slotsOcupados || 1;
                      // Calcular la altura basada en slots ocupados (cada slot = 64px aprox)
                      const alturaCalculada = slotsOcupados * 64;
                      
                      console.log(`Renderizando cita ${cita.id_cita}:`, { 
                        alturaCalculada, 
                        slotsOcupados 
                      });
                      
                      return (
                        <AgendaEventCard
                          key={cita.id_cita}
                          cita={cita}
                          onEdit={onEdit}
                          alturaCalculada={alturaCalculada}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-12 md:h-16">
                    <span className="text-qoder-dark-text-secondary text-xs md:text-sm">
                      Sin citas
                    </span>
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