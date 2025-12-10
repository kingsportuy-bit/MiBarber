import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { MetaBarbero } from "@/types/caja";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useMetaBarbero(idBarbero: string, mes: number, anio: number) {
  const supabase = getSupabaseClient();
  const { idBarberia } = useAuth();

  return useQuery({
    queryKey: ['metas', idBarbero, mes, anio],
    queryFn: async (): Promise<MetaBarbero | null> => {
      if (!idBarberia || !idBarbero) return null;

      const { data, error } = await supabase
        .from('mibarber_metas')
        .select('*')
        .eq('id_barbero', idBarbero)
        .eq('mes', mes)
        .eq('anio', anio)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no se encontró fila
        console.error("❌ Error obteniendo meta del barbero:", error);
        throw error;
      }

      return data || null;
    },
    enabled: !!idBarberia && !!idBarbero,
  });
}

export function useCrearMeta() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const { idBarberia } = useAuth();

  return useMutation({
    mutationFn: async (nuevaMeta: Omit<MetaBarbero, 'id_meta' | 'created_at' | 'updated_at'>) => {
      if (!idBarberia) {
        throw new Error('No se puede crear meta sin datos de autenticación');
      }

      const { data, error } = await supabase
        .from('mibarber_metas')
        .insert([nuevaMeta])
        .select();

      if (error) {
        throw error;
      }

      return data[0] as MetaBarbero;
    },
    onSuccess: () => {
      // Invalidar queries de metas
      queryClient.invalidateQueries({ queryKey: ['metas'] });
    },
  });
}

export function useActualizarMeta() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_meta, ...updates }: Partial<MetaBarbero> & { id_meta: string }) => {
      const { data, error } = await supabase
        .from('mibarber_metas')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id_meta', id_meta)
        .select();

      if (error) {
        throw error;
      }

      return data[0] as MetaBarbero;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] });
    },
  });
}