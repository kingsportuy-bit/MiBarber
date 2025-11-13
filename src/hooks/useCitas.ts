// Hook compuesto para gestión de citas - mantiene compatibilidad con API existente
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from '@/types/db';
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

// Importar los hooks especializados
import { useCitasList } from '@/features/appointments/hooks/useCitasList';
import { useCreateCita } from '@/features/appointments/hooks/useCreateCita';
import { useUpdateCita } from '@/features/appointments/hooks/useUpdateCita';
import { useDeleteCita } from '@/features/appointments/hooks/useDeleteCita';
import { useCitasPorRango } from '@/features/appointments/hooks/useCitasPorRango';
import { useHorariosDisponiblesCompleto } from '@/hooks/useHorariosDisponiblesCompleto';

interface UseCitasProps {
  sucursalId?: string;
  fecha?: string;
  barberoId?: string;
  page?: number;
  pageSize?: number;
}

export function useCitas(props?: UseCitasProps) {
  const { sucursalId, fecha, barberoId, page, pageSize } = props || {};
  
  console.log('📅 useCitas - Parámetros recibidos:', { sucursalId, fecha, barberoId, page, pageSize });
  
  const citasQuery = useCitasList({ sucursalId, fecha, barberoId, page, pageSize });
  const createMutation = useCreateCita();
  const updateMutation = useUpdateCita();
  const deleteMutation = useDeleteCita();
  
  // Funciones para rango de fechas y horarios disponibles
  const useCitasPorRangoFn = (sucursalId?: string, fechaInicio?: string, fechaFin?: string) => 
    useCitasPorRango({ sucursalId, fechaInicio, fechaFin });
  
  const useHorariosDisponiblesFn = (sucursalId?: string, fecha?: string, barberoId?: string) => 
    useHorariosDisponiblesCompleto({ idSucursal: sucursalId, idBarbero: barberoId, fecha });

  return {
    ...citasQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    refetch: citasQuery.refetch,
    useCitasPorRango: useCitasPorRangoFn,
    useHorariosDisponibles: useHorariosDisponiblesFn,
  };
}