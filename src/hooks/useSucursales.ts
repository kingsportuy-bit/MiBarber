import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Sucursal } from "@/types/db";

export function useSucursales(idBarberia?: string) {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  // Obtener todas las sucursales de una barbería
  const getAllSucursales = useQuery({
    queryKey: ["sucursales", idBarberia],
    queryFn: async () => {
      if (!idBarberia) {
        return [];
      }
      
      const { data, error } = await (supabase as any)
        .from("mibarber_sucursales")
        .select("*")
        .eq("id_barberia", idBarberia)
        .order("numero_sucursal");
      
      if (error) {
        throw error;
      }
      
      return data as Sucursal[];
    },
    enabled: !!idBarberia,
  });

  // Crear una nueva sucursal
  const createSucursal = useMutation({
    mutationFn: async (newSucursal: Omit<Sucursal, "id" | "created_at" | "updated_at" | "numero_sucursal">) => {
      // Primero obtener el número de sucursal siguiente
      const { data: maxNumero, error: countError } = await (supabase as any)
        .from("mibarber_sucursales")
        .select("numero_sucursal")
        .eq("id_barberia", newSucursal.id_barberia)
        .order("numero_sucursal", { ascending: false })
        .limit(1)
        .single();
      
      if (countError && countError.code !== 'PGRST116') { // PGRST116 es "no rows returned"
        throw countError;
      }
      
      const nextNumero = maxNumero ? (maxNumero as any).numero_sucursal + 1 : 1;
      
      const { data, error } = await (supabase as any)
        .from("mibarber_sucursales")
        .insert([{
          ...newSucursal,
          numero_sucursal: nextNumero,
        }] as any)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as Sucursal;
    },
    onSuccess: () => {
      console.log('✅ onSuccess ejecutado - Limpiando cache');
      // ✅ DESPUÉS (BORRA TODO)
      queryClient.removeQueries({ queryKey: ["sucursales"] });
      queryClient.removeQueries({ queryKey: ["barberos-list"] });
      queryClient.removeQueries({ queryKey: ["barberos"] });
      queryClient.removeQueries({ queryKey: ["citas"] });
      queryClient.removeQueries({ queryKey: ["horarios"] });
      queryClient.removeQueries({ queryKey: ["dashboard"] });
      queryClient.removeQueries({ queryKey: ["estadisticas"] });
      queryClient.removeQueries({ queryKey: ["clientes"] });

      // Forzar refresh inmediato
      queryClient.refetchQueries({
        queryKey: ["sucursales"],
        type: 'active'
      });
      
      console.log('✅ Cache limpiado y queries refetchadas');
      // ✅ SOLUCIÓN MEJORADA: No recargar la página, solo refetch queries
      // setTimeout(() => {
      //   console.log('🔄 RELOAD NOW!');
      //   window.location.reload();
      // }, 500);
    },
  });

  // Actualizar una sucursal
  const updateSucursal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sucursal> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("mibarber_sucursales")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as Sucursal;
    },
    onSuccess: () => {
      console.log('✅ onSuccess ejecutado - Limpiando cache');
      // ✅ DESPUÉS (BORRA TODO)
      queryClient.removeQueries({ queryKey: ["sucursales"] });
      queryClient.removeQueries({ queryKey: ["barberos-list"] });
      queryClient.removeQueries({ queryKey: ["barberos"] });
      queryClient.removeQueries({ queryKey: ["citas"] });
      queryClient.removeQueries({ queryKey: ["horarios"] });
      queryClient.removeQueries({ queryKey: ["dashboard"] });
      queryClient.removeQueries({ queryKey: ["estadisticas"] });
      queryClient.removeQueries({ queryKey: ["clientes"] });

      // Forzar refresh inmediato
      queryClient.refetchQueries({
        queryKey: ["sucursales"],
        type: 'active'
      });
      
      console.log('✅ Cache limpiado y queries refetchadas');
      // ✅ SOLUCIÓN MEJORADA: No recargar la página, solo refetch queries
      // setTimeout(() => {
      //   console.log('🔄 RELOAD NOW!');
      //   window.location.reload();
      // }, 500);
    },
  });

  // Eliminar una sucursal
  const deleteSucursal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("mibarber_sucursales")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      console.log('✅ onSuccess ejecutado - Limpiando cache');
      // ✅ DESPUÉS (BORRA TODO)
      queryClient.removeQueries({ queryKey: ["sucursales"] });
      queryClient.removeQueries({ queryKey: ["barberos-list"] });
      queryClient.removeQueries({ queryKey: ["barberos"] });
      queryClient.removeQueries({ queryKey: ["citas"] });
      queryClient.removeQueries({ queryKey: ["horarios"] });
      queryClient.removeQueries({ queryKey: ["dashboard"] });
      queryClient.removeQueries({ queryKey: ["estadisticas"] });
      queryClient.removeQueries({ queryKey: ["clientes"] });

      // Forzar refresh inmediato
      queryClient.refetchQueries({
        queryKey: ["sucursales"],
        type: 'active'
      });
      
      console.log('✅ Cache limpiado y queries refetchadas');
      // ✅ SOLUCIÓN MEJORADA: No recargar la página, solo refetch queries
      // setTimeout(() => {
      //   console.log('🔄 RELOAD NOW!');
      //   window.location.reload();
      // }, 500);
    },
  });

  return {
    sucursales: getAllSucursales.data,
    isLoading: getAllSucursales.isLoading,
    isError: getAllSucursales.isError,
    error: getAllSucursales.error,
    createSucursal,
    updateSucursal,
    deleteSucursal,
  };
}