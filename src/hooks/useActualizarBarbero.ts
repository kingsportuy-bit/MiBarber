import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Barbero } from "@/types/db";

export function useActualizarBarbero() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const actualizarBarberoMutation = useMutation({
    mutationFn: async ({ 
      id_barbero, 
      username,
      email,
      telefono,
      especialidades
    }: {
      id_barbero: string;
      username?: string;
      email?: string;
      telefono?: string;
      especialidades?: string[];
    }) => {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      // Solo agregar campos que se van a actualizar
      if (username !== undefined) updates.username = username;
      if (email !== undefined) updates.email = email;
      if (telefono !== undefined) updates.telefono = telefono;
      if (especialidades !== undefined) updates.especialidades = especialidades;

      const { data, error } = await (supabase as any)
        .from("mibarber_barberos")
        .update(updates)
        .eq("id_barbero", id_barbero)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Barbero;
    },
    onSuccess: () => {
      // Invalidar las consultas relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["barberoAuth"] });
    },
  });

  return {
    actualizarBarbero: actualizarBarberoMutation.mutateAsync,
    isLoading: actualizarBarberoMutation.isPending,
    error: actualizarBarberoMutation.error,
  };
}