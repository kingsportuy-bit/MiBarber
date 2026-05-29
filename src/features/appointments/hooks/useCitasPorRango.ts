// Hook para obtener citas por rango de fechas
import { useQuery } from "@tanstack/react-query";
import { getAppointmentRepository } from "@/lib/adapters/factory";
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
      
      // Si no se proporciona barberoId y el usuario no es administrador, solo mostrar sus propias citas
      let finalBarberoId = barberoId;
      if (!finalBarberoId && !isAdmin && barberoActual?.id_barbero) {
        finalBarberoId = barberoActual.id_barbero;
      }
      
      // Llamar al repositorio
      const citas = await appointmentRepository.listPorRango({
        sucursalId,
        fechaInicio,
        fechaFin,
        barberoId: finalBarberoId
      });
      
      // El repositorio ya filtra por barbero, fecha, sucursal.
      // Si tenemos un idBarberia (en caso de que el token pertenezca a un ecosistema multitenant), 
      // y la data viene de supabase, podríamos tener que filtrarla acá si el adapter no lo hace,
      // pero para mantener el patrón adaptamos:
      if (idBarberia) {
        return citas.filter(c => c.id_barberia === idBarberia);
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