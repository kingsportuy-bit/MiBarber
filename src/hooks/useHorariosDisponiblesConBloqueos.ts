// Hook para obtener horarios disponibles considerando bloqueos
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from '@/types/db';
import type { HorariosDisponiblesParams } from '@/features/appointments/types';
import { useBloqueosPorDia } from "./useBloqueosBarbero";

export interface UseHorariosDisponiblesConBloqueosResult {
  data: Appointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHorariosDisponiblesConBloqueos({
  sucursalId,
  fecha,
  barberoId
}: HorariosDisponiblesParams): UseHorariosDisponiblesConBloqueosResult {
  const supabase = getSupabaseClient();
  
  // Obtener los bloqueos para el día
  const {
    data: bloqueos,
    isLoading: isLoadingBloqueos,
    isError: isErrorBloqueos,
    error: errorBloqueos
  } = useBloqueosPorDia({
    idSucursal: sucursalId || '',
    idBarbero: barberoId,
    fecha: fecha || ''
  });

  const queryResult = useQuery({
    queryKey: ["horarios-disponibles", sucursalId, fecha, barberoId],
    queryFn: async () => {
      if (!sucursalId || !fecha) {
        return [];
      }
      
      let q: any = supabase.from("mibarber_citas").select("*");
      
      // Filtrar por sucursal
      q = q.eq("id_sucursal", sucursalId);
      
      // Filtrar por fecha
      q = q.eq("fecha", fecha);
      
      // Si se especifica un barbero, filtrar por él
      if (barberoId) {
        q = q.eq("id_barbero", barberoId);
      }
      
      const { data, error } = await q.order("hora", { ascending: true });
      if (error) throw error;
      
      // Si hay bloqueos, filtrar las citas según los bloqueos
      if (bloqueos && bloqueos.length > 0) {
        // Verificar si hay un bloqueo de día completo
        const bloqueoDiaCompleto = bloqueos.some((bloqueo: any) => bloqueo.tipo === 'bloqueo_dia');
        
        if (bloqueoDiaCompleto) {
          // Si hay un bloqueo de día completo, no hay horarios disponibles
          return [];
        }
        
        // Filtrar citas que caen dentro de bloqueos de horas o descansos
        return (data as Appointment[]).filter(cita => {
          const citaHora = cita.hora?.slice(0, 5); // HH:mm
          if (!citaHora) return true;
          
          // Verificar si la cita cae dentro de algún bloqueo
          return !bloqueos.some((bloqueo: any) => {
            // Para bloqueo_horas: verificar si la cita cae dentro del rango del bloqueo
            if (bloqueo.tipo === 'bloqueo_horas') {
              if (bloqueo.hora_inicio && bloqueo.hora_fin) {
                return citaHora >= bloqueo.hora_inicio && citaHora < bloqueo.hora_fin;
              }
              return false;
            }
            
            // Para descanso: verificar si la cita cae dentro del rango del bloqueo
            // y si el día de la semana coincide con los días seleccionados
            if (bloqueo.tipo === 'descanso' && bloqueo.dias_semana) {
              try {
                // Parsear los días de la semana seleccionados
                const diasSeleccionados = JSON.parse(bloqueo.dias_semana);
                if (Array.isArray(diasSeleccionados)) {
                  // Parsear la fecha manualmente para evitar problemas de zona horaria
                  const [year, month, day] = fecha.split("-").map(Number);
                  // Crear una fecha en la zona horaria local (ajustando a mediodía para evitar problemas de DST)
                  const fechaCita = new Date(year, month - 1, day, 12, 0, 0);
                  const diaSemana = fechaCita.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
                  
                  // Verificar si este día está seleccionado (ajustando el índice: 0=Lunes, ..., 6=Domingo)
                  const indiceDia = diaSemana === 0 ? 6 : diaSemana - 1;
                  
                  // Si el día está seleccionado, verificar si la hora cae dentro del rango
                  if (diasSeleccionados[indiceDia]) {
                    if (bloqueo.hora_inicio && bloqueo.hora_fin) {
                      return citaHora >= bloqueo.hora_inicio && citaHora < bloqueo.hora_fin;
                    }
                  }
                }
              } catch (e) {
                console.error("Error al parsear días de la semana:", e);
              }
              return false;
            }
            
            return false;
          });
        });
      }
      
      return data as Appointment[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!sucursalId && !!fecha && !isLoadingBloqueos,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading || isLoadingBloqueos,
    isError: queryResult.isError || isErrorBloqueos,
    error: queryResult.error || errorBloqueos || null,
    refetch: queryResult.refetch,
  };
}