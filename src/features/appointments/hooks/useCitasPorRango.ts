// Hook para obtener citas por rango de fechas
import { useQuery } from "@tanstack/react-query";
import { getAppointmentReadRepository } from "@/lib/adapters/factory";
import type { Appointment } from '@/types/db';
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import type { CitasPorRangoParams } from '../types';

export interface UseCitasPorRangoResult {
  data: Appointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCitasPorRango({
  sucursalId,
  fechaInicio,
  fechaFin,
  barberoId
}: CitasPorRangoParams & { barberoId?: string }): UseCitasPorRangoResult {
  const appointmentRepository = getAppointmentRepository();
  const { barbero: barberoActual, isAdmin, idBarberia } = useBarberoAuth();

  const queryResult = useQuery({
    queryKey: ["citas-rango", sucursalId, fechaInicio, fechaFin, barberoId || barberoActual?.id_barbero, isAdmin],
    queryFn: async () => {
      if (!fechaInicio || !fechaFin) {
        return [];
      }
      
      const repo = getAppointmentReadRepository();
      return await repo.listarPorRango({
        sucursalId: sucursalId,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        barberoId: barberoId || (!isAdmin ? barberoActual?.id_barbero : undefined),
      });
      }
      
      return citas;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
}