// hooks/useHorariosDisponiblesCompleto.ts
import { useQuery } from "@tanstack/react-query";
import type { HorariosDisponiblesParams } from "@/types/horarios";

interface HorariosDisponiblesResult {
  horariosDisponibles: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useHorariosDisponiblesCompleto({
  idSucursal,
  idBarbero,
  fecha,
  idCitaEditando, // Para excluir cita actual al editar
}: HorariosDisponiblesParams): HorariosDisponiblesResult {
  const query = useQuery({
    queryKey: [
      "horarios-disponibles-completo",
      idSucursal,
      idBarbero,
      fecha,
      idCitaEditando,
    ],
    queryFn: async () => {
      if (!idSucursal || !idBarbero || !fecha) {
        return [];
      }

      const params = new URLSearchParams({
        idSucursal,
        idBarbero,
        fecha,
        ...(idCitaEditando && { idCitaEditando }),
      });

      const response = await fetch(
        `/api/horarios-disponibles?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener horarios disponibles");
      }

      return response.json();
    },
    enabled: !!idSucursal && !!idBarbero && !!fecha,
  });

  return {
    horariosDisponibles: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}