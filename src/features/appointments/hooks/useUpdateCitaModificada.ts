// Hook para actualizar una cita existente y automáticamente establecer el estado a "modificado"
// Sincronizado con WEB.md — incluye sync de mibarber_clientes (fase, stats, contexto_turno_id)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from '@/types/db';
import type { UpdateCitaData } from '../types';

export interface UpdateCitaModificadaResult {
  mutate: (updates: Partial<Appointment> & { id_cita: string }) => void;
  mutateAsync: (updates: Partial<Appointment> & { id_cita: string }) => Promise<Appointment>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useUpdateCitaModificada(): UpdateCitaModificadaResult {
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
      
      // Lógica condicional para el estado y notificaciones
      if (updates.estado === "cancelado") {
        // ── Cancelar turno (WEB.md §3) ──
        cleanedUpdates.estado = "cancelado";
        cleanedUpdates.estado_ciclo = "cancelado";
      } else {
        // ── Modificar turno (WEB.md §2) ──
        cleanedUpdates.estado = "modificado";
        cleanedUpdates.estado_ciclo = "pendiente"; // Reset de ciclo operativo al reagendar
      }
      
      // Siempre reiniciar la notificación del barbero para disparar trigger
      cleanedUpdates.notificacion_barbero = "no";
      
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
          
          // Sync cliente para el retry también
          await syncClienteAfterUpdate(supabase, retryData, updates.estado === "cancelado");
          
          return retryData as Appointment;
        }
        
        throw error;
      }
      
      // ── Sync mibarber_clientes según acción ──
      await syncClienteAfterUpdate(supabase, data, updates.estado === "cancelado");
      
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
 * Sync mibarber_clientes después de actualizar una cita
 * Según WEB.md §2 (modificar) y §3 (cancelar)
 */
async function syncClienteAfterUpdate(
  supabase: any,
  citaData: any,
  isCancelacion: boolean
) {
  if (!citaData?.id_cliente) return;
  
  const idCliente = citaData.id_cliente;
  
  try {
    if (isCancelacion) {
      // ── Cancelar: WEB.md §3 ──
      // 1. Incrementar stats.turnos_cancelados
      const { data: clienteActual } = await supabase
        .from("mibarber_clientes")
        .select("stats, total_visitas")
        .eq("id_cliente", idCliente)
        .single();
      
      const currentStats = clienteActual?.stats || { reactivaciones: 0, turnos_cancelados: 0, turnos_completados: 0, turnos_reagendados: 0 };
      currentStats.turnos_cancelados = (currentStats.turnos_cancelados || 0) + 1;
      
      // 2. Verificar si tiene otros turnos activos
      const { data: otrosTurnos } = await supabase
        .from("mibarber_citas")
        .select("id_cita")
        .eq("id_cliente", idCliente)
        .in("estado", ["pendiente", "confirmada"])
        .neq("id_cita", citaData.id_cita)
        .limit(1);
      
      let nuevaFase: string;
      let nuevoContextoTurnoId: string | null = null;
      
      if (otrosTurnos && otrosTurnos.length > 0) {
        // Todavía tiene otro turno activo: mantener fase 2
        nuevaFase = '2';
        nuevoContextoTurnoId = otrosTurnos[0].id_cita;
      } else {
        // No tiene más turnos activos
        nuevaFase = (clienteActual?.total_visitas || 0) > 0 ? '6' : '1';
      }
      
      const clienteUpdate: any = {
        fase: nuevaFase,
        fase_updated_at: new Date().toISOString(),
        stats: currentStats,
        booking_data: {},
        estado_turno: null,
        contexto_turno_id: nuevoContextoTurnoId,
      };
      
      // Limpiar session_ctx.cancelacionReciente
      clienteUpdate.session_ctx = {};
      
      const { error } = await supabase
        .from("mibarber_clientes")
        .update(clienteUpdate)
        .eq("id_cliente", idCliente);
      
      if (error) {
        console.error('⚠️ Error sincronizando cliente (cancelación):', error);
      } else {
        console.log('✅ Cliente sincronizado tras cancelación: fase=', nuevaFase);
      }
    } else {
      // ── Modificar: WEB.md §2 ──
      // 1. Incrementar stats.turnos_reagendados
      const { data: clienteActual } = await supabase
        .from("mibarber_clientes")
        .select("stats")
        .eq("id_cliente", idCliente)
        .single();
      
      const currentStats = clienteActual?.stats || { reactivaciones: 0, turnos_cancelados: 0, turnos_completados: 0, turnos_reagendados: 0 };
      currentStats.turnos_reagendados = (currentStats.turnos_reagendados || 0) + 1;
      
      const clienteUpdate: any = {
        fase: '2',
        fase_anterior: null,
        fase_updated_at: new Date().toISOString(),
        contexto_turno_id: citaData.id_cita,
        booking_data: {},
        estado_turno: null, // Regla 3: limpiar contexto conversacional
        stats: currentStats,
      };
      
      const { error } = await supabase
        .from("mibarber_clientes")
        .update(clienteUpdate)
        .eq("id_cliente", idCliente);
      
      if (error) {
        console.error('⚠️ Error sincronizando cliente (modificación):', error);
      } else {
        console.log('✅ Cliente sincronizado tras modificación: fase=2, reagendados=', currentStats.turnos_reagendados);
      }
    }
  } catch (syncError) {
    console.error('⚠️ Error en sync de cliente:', syncError);
    // No lanzar error — la cita ya se actualizó
  }
}