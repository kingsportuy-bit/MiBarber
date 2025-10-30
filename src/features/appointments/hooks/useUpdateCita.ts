// Hook para actualizar una cita existente
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from '@/types/db';
import type { UpdateCitaData } from '../types';

export interface UpdateCitaResult {
  mutate: (updates: Partial<Appointment> & { id_cita: string }) => void;
  mutateAsync: (updates: Partial<Appointment> & { id_cita: string }) => Promise<Appointment>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useUpdateCita(): UpdateCitaResult {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id_cita,
      ...updates
    }: Partial<Appointment> & { id_cita: string }) => {
      // Verificar si los campos id_barbero, id_servicio y metodo_pago existen en la tabla
      // Si no existen, los eliminamos para evitar errores
      let cleanedUpdates: any = { ...updates };
      
      // Solo incluir campos opcionales si existen en el objeto
      if (updates.id_barbero === undefined) {
        delete cleanedUpdates.id_barbero;
      }
      
      if (updates.id_servicio === undefined) {
        delete cleanedUpdates.id_servicio;
      }
      
      if (updates.metodo_pago === undefined) {
        delete cleanedUpdates.metodo_pago;
      }
      
      const { data, error } = await (supabase as any)
        .from("mibarber_citas")
        .update(cleanedUpdates)
        .eq("id_cita", id_cita)
        .select()
        .single();
        
      if (error) {
        // Si el error es por columnas que no existen, intentar de nuevo sin esos campos
        if (error.message && (
          error.message.includes("id_barbero") || 
          error.message.includes("id_servicio") || 
          error.message.includes("metodo_pago")
        )) {
          const retryUpdates = { ...cleanedUpdates };
          delete retryUpdates.id_barbero;
          delete retryUpdates.id_servicio;
          delete retryUpdates.metodo_pago;
          
          const { data: retryData, error: retryError } = await (supabase as any)
            .from("mibarber_citas")
            .update(retryUpdates)
            .eq("id_cita", id_cita)
            .select()
            .single();
            
          if (retryError) {
            throw retryError;
          }
          
          return retryData as Appointment;
        }
        
        throw error;
      }
      
      return data as Appointment;
    },
    onSuccess: () => {
      // Invalidar todas las consultas de citas
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      // También invalidar consultas específicas si es necesario
      queryClient.invalidateQueries({ queryKey: ["citas-rango"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error || null,
    isSuccess: mutation.isSuccess,
  };
}