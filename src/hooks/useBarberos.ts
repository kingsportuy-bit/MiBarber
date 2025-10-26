"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Barbero } from "@/types/db";

type UseBarberosResult = UseQueryResult<Barbero[], Error> & {
  createBarbero: any;
  updateBarbero: any;
  deleteBarbero: any;
};

export function useBarberos(sucursalId?: string): UseBarberosResult {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  // Obtener todos los barberos
  const getAllBarberos = useQuery({
    queryKey: ["barberos", sucursalId],
    queryFn: async () => {
      console.log("useBarberos: Obteniendo barberos para sucursalId:", sucursalId);
      
      let query = (supabase as any).from("mibarber_barberos").select("*");
      
      if (sucursalId) {
        console.log("useBarberos: Filtrando por id_sucursal:", sucursalId);
        query = query.eq("id_sucursal", sucursalId);
      }
      
      const { data, error } = await query.order("nombre");
      
      console.log("useBarberos: Resultado de la consulta:", { data, error });
      
      if (error) {
        console.error("useBarberos: Error al obtener barberos:", error);
        throw error;
      }
      
      console.log("useBarberos: Barberos obtenidos:", data);
      return data as Barbero[];
    },
  });

  // Crear un nuevo barbero
  const createBarbero = useMutation({
    mutationFn: async (newBarbero: Omit<Barbero, "id_barbero">) => {
      // Establecer nivel_permisos por defecto a 2 (barbero normal) si no se especifica
      const barberoToInsert = {
        ...newBarbero,
        nivel_permisos: newBarbero.nivel_permisos || 2,
        admin: newBarbero.admin || false
      };
      
      const { data, error } = await (supabase as any)
        .from("mibarber_barberos")
        .insert([barberoToInsert])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as Barbero;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberos"] });
    },
  });

  // Actualizar un barbero
  const updateBarbero = useMutation({
    mutationFn: async ({ id_barbero, ...updates }: Partial<Barbero> & { id_barbero: string }) => {
      // Verificar si se está intentando cambiar el nivel de permisos de un barbero protegido
      // Primero obtener el barbero actual para verificar su nivel de permisos
      const { data: currentBarbero, error: fetchError } = await (supabase as any)
        .from("mibarber_barberos")
        .select("*")
        .eq("id_barbero", id_barbero)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Si el barbero actual tiene nivel_permisos 1 (protegido), no permitir cambiar el nivel de permisos
      if (currentBarbero.nivel_permisos === 1 && updates.nivel_permisos !== undefined && updates.nivel_permisos !== 1) {
        throw new Error("No se puede cambiar el nivel de permisos de un barbero protegido");
      }
      
      // No permitir modificar nivel_permisos en general
      if (updates.nivel_permisos !== undefined && updates.nivel_permisos !== currentBarbero.nivel_permisos) {
        throw new Error("No se puede modificar el nivel de permisos de un barbero");
      }
      
      // Si se cambia admin, verificar que no se intente asignar admin=true a un barbero protegido que ya lo es
      // o quitar admin=false a un barbero protegido
      if (updates.admin !== undefined) {
        // Si es un barbero protegido (nivel_permisos = 1)
        if (currentBarbero.nivel_permisos === 1) {
          // No permitir quitar admin=false para barberos protegidos
          if (updates.admin === false) {
            throw new Error("No se puede quitar el rol de administrador a un barbero protegido");
          }
        }
        // Para barberos normales (nivel_permisos = 2), se permite cambiar admin a true o false
      }
      
      console.log("useBarberos: Actualizando barbero con datos:", { id_barbero, updates });
      
      const { data, error } = await (supabase as any)
        .from("mibarber_barberos")
        .update(updates)
        .eq("id_barbero", id_barbero)
        .select()
        .single();
      
      if (error) {
        console.error("useBarberos: Error al actualizar barbero:", error);
        throw error;
      }
      
      console.log("useBarberos: Barbero actualizado:", data);
      return data as Barbero;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberos"] });
    },
  });

  // Eliminar un barbero
  const deleteBarbero = useMutation({
    mutationFn: async (id_barbero: string) => {
      // Verificar si se está intentando eliminar un barbero protegido
      // Primero obtener el barbero actual para verificar su nivel de permisos
      const { data: currentBarbero, error: fetchError } = await (supabase as any)
        .from("mibarber_barberos")
        .select("nivel_permisos")
        .eq("id_barbero", id_barbero)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Si el barbero tiene nivel_permisos 1 (protegido), no permitir eliminarlo
      if (currentBarbero.nivel_permisos === 1) {
        throw new Error("No se puede eliminar un barbero protegido");
      }
      
      const { error } = await (supabase as any)
        .from("mibarber_barberos")
        .delete()
        .eq("id_barbero", id_barbero);
      
      if (error) {
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberos"] });
    },
  });

  return {
    ...getAllBarberos,
    createBarbero,
    updateBarbero,
    deleteBarbero,
  };
}