// Hook para obtener horarios disponibles (en realidad obtiene las citas para calcular ocupación)
import { useQuery } from "@tanstack/react-query";
import { getAppointmentRepository } from "@/lib/adapters/factory";
import type { Appointment } from '@/types/db';
import type { HorariosDisponiblesParams } from '../types';

export interface UseHorariosDisponiblesResult {
  data: Appointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHorariosDisponibles({
  sucursalId,
  fecha,
  barberoId
}: HorariosDisponiblesParams): UseHorariosDisponiblesResult {
  const appointmentRepository = getAppointmentRepository();

  const queryResult = useQuery({
    queryKey: ["horarios-disponibles", sucursalId, fecha, barberoId],
    queryFn: async () => {
      if (!sucursalId || !fecha) {
        return [];
      }
      
      // Llamar al repositorio (este método devuelve las citas para esa fecha, 
      // lo cual se usa luego en la UI para calcular qué horarios están libres)
      const citas = await appointmentRepository.list({
        sucursalId,
        fecha,
        barberoId,
        page: 1,
        pageSize: 1000 // Suficiente para un día
      });
      
      return citas;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
}