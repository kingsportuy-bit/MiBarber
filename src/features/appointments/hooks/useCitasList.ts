// Hook para obtener la lista de citas
import { useQuery } from "@tanstack/react-query";
import type { Appointment } from '@/types/db';
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { getAppointmentRepository } from "@/lib/adapters/factory";

interface UseCitasListResult {
  data: Appointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseCitasListProps {
  sucursalId?: string;
  fecha?: string;
  barberoId?: string;
  page?: number;
  pageSize?: number;
}

export function useCitasList({
  sucursalId,
  fecha,
  barberoId,
  page = 1,
  pageSize = 100 // Aumentar el tamaño de página para obtener más citas
}: UseCitasListProps): UseCitasListResult {
  const { barbero: barberoActual, isAdmin, idBarberia } = useBarberoAuth();
  const appointmentRepository = getAppointmentRepository();

  const queryResult = useQuery({
    queryKey: ["citas", sucursalId, fecha, barberoId, barberoActual?.id_barbero, isAdmin, idBarberia, page, pageSize],
    queryFn: async () => {
      console.log('🔍 Parámetros de consulta de citas (vía Adaptador):', { sucursalId, fecha, barberoId, isAdmin, barberoActual: barberoActual?.id_barbero, idBarberia });
      
      // Si no se especificó un barbero pero tenemos un barbero logueado, usar su id
      let finalBarberoId = barberoId;
      if (!finalBarberoId && barberoActual?.id_barbero && (barberoId === undefined || barberoId === null)) {
        finalBarberoId = barberoActual.id_barbero;
      }

      return appointmentRepository.list({
        sucursalId,
        fecha,
        barberoId: finalBarberoId,
        page,
        pageSize
      });
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