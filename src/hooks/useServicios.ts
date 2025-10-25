import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Service } from "@/types/db";

export function useServicios(idSucursal?: string) {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const getAllServicios = useQuery({
    queryKey: ["servicios", idSucursal],
    queryFn: async () => {
      let query = (supabase as any)
        .from("mibarber_servicios")
        .select("*")
        .eq("activo", true)
        .order("nombre", { ascending: true });
      
      // Si se proporciona una sucursal, filtrar por ella
      if (idSucursal) {
        query = query.eq("id_sucursal", idSucursal);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("❌ Error obteniendo servicios:", error);
        throw error;
      }
      
      return data as Service[];
    },
  });

  const createServicio = useMutation({
    mutationFn: async (newServicio: Omit<Service, "id_servicio" | "created_at" | "updated_at">) => {
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .insert([newServicio])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });

  const updateServicio = useMutation({
    mutationFn: async ({ id_servicio, ...updates }: Partial<Service> & { id_servicio: string }) => {
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .update(updates)
        .eq("id_servicio", id_servicio)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });

  const deleteServicio = useMutation({
    mutationFn: async (id_servicio: string) => {
      const { error } = await (supabase as any)
        .from("mibarber_servicios")
        .delete()
        .eq("id_servicio", id_servicio);
      
      if (error) {
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });

  return {
    servicios: getAllServicios.data || [],
    isLoading: getAllServicios.isLoading,
    isError: getAllServicios.isError,
    error: getAllServicios.error,
    createServicio,
    updateServicio,
    deleteServicio,
  };
}