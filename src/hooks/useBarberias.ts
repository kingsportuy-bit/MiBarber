import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Barberia } from "@/types/db";

export function useBarberias() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const getAllBarberias = useQuery({
    queryKey: ["barberias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mibarber_barberias")
        .select("*")
        .order("nombre_barberia", { ascending: true });
      
      if (error) {
        console.error("❌ Error obteniendo barberías:", error);
        throw error;
      }
      
      return data as Barberia[];
    },
  });

  const createBarberia = useMutation({
    mutationFn: async (newBarberia: Omit<Barberia, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await (supabase as any)
        .from("mibarber_barberias")
        .insert([newBarberia])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as Barberia;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberias"] });
    },
  });

  const updateBarberia = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Barberia> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("mibarber_barberias")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as Barberia;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberias"] });
    },
  });

  const deleteBarberia = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("mibarber_barberias")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberias"] });
    },
  });

  return {
    barberias: getAllBarberias.data || [],
    isLoading: getAllBarberias.isLoading,
    isError: getAllBarberias.isError,
    error: getAllBarberias.error,
    createBarberia,
    updateBarberia,
    deleteBarberia,
  };
}