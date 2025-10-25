"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * Hook personalizado para obtener un registro específico por ID
 * 
 * @param tableName - Nombre de la tabla en la base de datos
 * @param id - ID del registro a obtener
 * @param idField - Nombre del campo ID (por defecto 'id')
 * @returns Objeto con los datos del registro y el estado de carga
 */
export function useRecordById<T>(
  tableName: string, 
  id: string | undefined, 
  idField: string = 'id'
) {
  const supabase = getSupabaseClient();

  const query = useQuery({
    queryKey: [tableName, id],
    queryFn: async (): Promise<T | null> => {
      if (!id) return null;
      
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select("*")
        .eq(idField, id)
        .single();
      
      if (error) {
        console.error(`Error fetching record from ${tableName}:`, error);
        throw error;
      }
      
      return data as T;
    },
    enabled: !!id, // Solo ejecutar la consulta si hay un ID
  });

  return query;
}