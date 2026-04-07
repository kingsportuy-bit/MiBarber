// Hook para cancelar una cita (no DELETE físico, sino UPDATE a estado='cancelado')
// Sincronizado con WEB.md §3 — incluye sync de mibarber_clientes (stats, fase)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";

export interface DeleteCitaResult {
  mutate: (id_cita: string) => void;
  mutateAsync: (id_cita: string) => Promise<boolean>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useDeleteCita(): DeleteCitaResult {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id_cita: string) => {
      // 1. Obtener datos de la cita antes de cancelarla (necesitamos id_cliente)
      const { data: citaActual, error: fetchError } = await (supabase as any)
        .from("mibarber_citas")
        .select("id_cita, id_cliente, estado")
        .eq("id_cita", id_cita)
        .single();
      
      if (fetchError) {
        console.error('❌ Error obteniendo cita para cancelar:', fetchError);
        throw fetchError;
      }
      
      // 2. UPDATE estado='cancelado' (no DELETE) + notificacion_barbero='no' para trigger
      const { error } = await (supabase as any)
        .from("mibarber_citas")
        .update({
          estado: "cancelado",
          estado_ciclo: "cancelado",
          notificacion_barbero: "no",
        })
        .eq("id_cita", id_cita);
      
      if (error) {
        console.error('❌ Error cancelando cita:', error);
        throw error;
      }
      
      // 3. Sync mibarber_clientes (WEB.md §3: Cancelar turno)
      if (citaActual?.id_cliente) {
        try {
          // Obtener stats actuales y total_visitas
          const { data: clienteActual } = await (supabase as any)
            .from("mibarber_clientes")
            .select("stats, total_visitas")
            .eq("id_cliente", citaActual.id_cliente)
            .single();
          
          const currentStats = clienteActual?.stats || {
            reactivaciones: 0,
            turnos_cancelados: 0,
            turnos_completados: 0,
            turnos_reagendados: 0,
          };
          currentStats.turnos_cancelados = (currentStats.turnos_cancelados || 0) + 1;
          
          // Verificar si tiene otros turnos activos
          const { data: otrosTurnos } = await (supabase as any)
            .from("mibarber_citas")
            .select("id_cita")
            .eq("id_cliente", citaActual.id_cliente)
            .in("estado", ["pendiente", "confirmada"])
            .neq("id_cita", id_cita)
            .limit(1);
          
          let nuevaFase: string;
          let nuevoContextoTurnoId: string | null = null;
          
          if (otrosTurnos && otrosTurnos.length > 0) {
            nuevaFase = '2';
            nuevoContextoTurnoId = otrosTurnos[0].id_cita;
          } else {
            nuevaFase = (clienteActual?.total_visitas || 0) > 0 ? '6' : '1';
          }
          
          const { error: clienteError } = await (supabase as any)
            .from("mibarber_clientes")
            .update({
              fase: nuevaFase,
              fase_updated_at: new Date().toISOString(),
              stats: currentStats,
              booking_data: {},
              estado_turno: null,
              contexto_turno_id: nuevoContextoTurnoId,
              session_ctx: {},
            })
            .eq("id_cliente", citaActual.id_cliente);
          
          if (clienteError) {
            console.error('⚠️ Error sincronizando cliente tras cancelación:', clienteError);
          } else {
            console.log('✅ Cliente sincronizado tras cancelación: fase=', nuevaFase, 'cancelados=', currentStats.turnos_cancelados);
          }
        } catch (syncError) {
          console.error('⚠️ Error en sync de cliente (cancelación):', syncError);
          // No lanzar error — la cita ya se canceló
        }
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
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