import { useQuery } from "@tanstack/react-query";
import type { HorariosDisponiblesParams } from "@/features/appointments/types";

interface HorariosDisponiblesResult {
  horariosDisponibles: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useHorariosDisponiblesCompleto({
  sucursalId,
  barberoId,
  fecha,
  idCitaEditando, // Para excluir cita actual al editar
  duracionServicio, // Nueva propiedad para la duración del servicio
}: HorariosDisponiblesParams & { idCitaEditando?: string; duracionServicio?: number }): HorariosDisponiblesResult {
  const query = useQuery({
    queryKey: [
      "horarios-disponibles-completo",
      sucursalId,
      barberoId,
      fecha,
      idCitaEditando,
      duracionServicio,
    ],
    queryFn: async () => {
      if (!sucursalId || !barberoId || !fecha) {
        return [];
      }

      const params = new URLSearchParams({
        idSucursal: sucursalId,
        idBarbero: barberoId,
        fecha,
        ...(idCitaEditando && { idCitaEditando }),
        ...(duracionServicio && { duracionServicio: duracionServicio.toString() }),
      });

      const response = await fetch(
        `/api/horarios-disponibles?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener horarios disponibles");
      }

      return response.json();
    },
    enabled: !!sucursalId && !!barberoId && !!fecha,
  });

  return {
    horariosDisponibles: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}