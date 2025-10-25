"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from "@/types/db";

/**
 * Hook personalizado para obtener un turno específico por ID
 * 
 * @param id_cita - ID del turno a obtener
 * @returns Objeto con los datos del turno y el estado de carga
 */
export function useCitaById(id_cita: string | undefined) {
  const supabase = getSupabaseClient();

  const query = useQuery({
    queryKey: ["turno", id_cita],
    queryFn: async (): Promise<Appointment | null> => {
      if (!id_cita) return null;
      
      const { data, error } = await (supabase as any)
        .from("mibarber_citas")
        .select("*")
        .eq("id_cita", id_cita)
        .single();
      
      if (error) {
        console.error("Error fetching turno:", error);
        // Si no se encuentra el turno, devolver null en lugar de lanzar un error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data as Appointment;
    },
    enabled: !!id_cita, // Solo ejecutar la consulta si hay un ID
    retry: 1, // Limitar los reintentos para evitar bucles infinitos
  });

  return query;
}
