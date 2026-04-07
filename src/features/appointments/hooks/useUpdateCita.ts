// Hook para actualizar una cita existente (update genérico)
// Sincronizado con WEB.md v2 — incluye:
//   - notificacion_barbero='no' para triggers
//   - Sync mibarber_clientes al completar (Reglas 2, 3, 4)
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
      
      // Si se está cambiando el estado, resetear notificacion_barbero para trigger
      if (updates.estado) {
        cleanedUpdates.notificacion_barbero = "no";
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
          
          // Sync cliente si es completado (retry path)
          if (updates.estado === "completado") {
            await syncClienteCompletado(supabase, retryData);
          }
          
          return retryData as Appointment;
        }
        
        throw error;
      }
      
      // ── Sync mibarber_clientes al completar (Reglas 2, 3, 4) ──
      if (updates.estado === "completado") {
        await syncClienteCompletado(supabase, data);
      }
      
      return data as Appointment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      queryClient.invalidateQueries({ queryKey: ["citas-rango"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles-completo"] });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
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

/**
 * Sync mibarber_clientes al completar un turno
 * Regla 2: completar → fase='6'
 * Regla 3: estado_turno = null
 * Regla 4: stats.turnos_completados += 1 (sin compensación)
 */
async function syncClienteCompletado(supabase: any, citaData: any) {
  if (!citaData?.id_cliente) return;
  
  const idCliente = citaData.id_cliente;
  
  try {
    // Obtener stats actuales y total_visitas
    const { data: clienteActual } = await supabase
      .from("mibarber_clientes")
      .select("stats, total_visitas")
      .eq("id_cliente", idCliente)
      .single();
    
    const currentStats = clienteActual?.stats || {
      reactivaciones: 0,
      turnos_cancelados: 0,
      turnos_completados: 0,
      turnos_reagendados: 0,
    };
    currentStats.turnos_completados = (currentStats.turnos_completados || 0) + 1;
    
    const clienteUpdate: any = {
      fase: '6',
      fase_updated_at: new Date().toISOString(),
      stats: currentStats,
      estado_turno: null, // Regla 3: limpiar contexto conversacional
      booking_data: {},
      session_ctx: {},
    };
    
    const { error } = await supabase
      .from("mibarber_clientes")
      .update(clienteUpdate)
      .eq("id_cliente", idCliente);
    
    if (error) {
      console.error('⚠️ Error sincronizando cliente (completado):', error);
    } else {
      console.log('✅ Cliente sincronizado tras completar: fase=6, completados=', currentStats.turnos_completados);
    }
  } catch (syncError) {
    console.error('⚠️ Error en sync de cliente (completado):', syncError);
    // No lanzar error — la cita ya se actualizó
  }
}