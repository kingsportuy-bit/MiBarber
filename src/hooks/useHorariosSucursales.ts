"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { HorarioSucursal } from "@/types/db";

export function useHorariosSucursales(idSucursal?: string) {
  const supabase: any = getSupabaseClient();
  const queryClient = useQueryClient();

  // Obtener horarios de una sucursal
  const horariosQuery = useQuery({
    queryKey: ["horarios_sucursales", idSucursal],
    queryFn: async (): Promise<HorarioSucursal[]> => {
      // Si no hay idSucursal, devolver array vacío
      if (!idSucursal) {
        console.log("useHorariosSucursales: No hay idSucursal, devolviendo array vacío");
        return [];
      }

      try {
        // Obtener los horarios de la sucursal
        const { data, error } = await supabase
          .from("mibarber_horarios_sucursales")
          .select("*")
          .eq("id_sucursal", idSucursal)
          .order("id_dia", { ascending: true });

        if (error) {
          console.error("Error al obtener horarios de sucursales:", error);
          throw error;
        }

        // Ya no consultamos mibarber_dias_semana porque nombre_dia es una columna generada
        // Mapeamos para agregar nombre_corto (los primeros 3 caracteres del nombre_dia)
        return (data || []).map((horario: any) => ({
          ...horario,
          nombre_corto: horario.nombre_dia ? horario.nombre_dia.substring(0, 3) : null
        })) as HorarioSucursal[];
      } catch (error) {
        console.error("Error en fetch de horarios:", error);
        return [];
      }
    },
    enabled: !!idSucursal && idSucursal !== "", // Solo ejecutar si hay idSucursal válido
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Crear o actualizar horario
  const upsertMutation = useMutation({
    mutationFn: async (horario: Omit<HorarioSucursal, "created_at" | "updated_at">) => {
      try {
        // Crear una copia del horario sin las propiedades calculadas
        const { nombre_dia, nombre_corto, ...horarioParaGuardar } = horario as any;

        // Asegurarse de que los campos de almuerzo sean null si están vacíos
        horarioParaGuardar.hora_inicio_almuerzo = horarioParaGuardar.hora_inicio_almuerzo || null;
        horarioParaGuardar.hora_fin_almuerzo = horarioParaGuardar.hora_fin_almuerzo || null;
        horarioParaGuardar.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from("mibarber_horarios_sucursales")
          .upsert(horarioParaGuardar)
          .select();

        if (error) {
          console.error("Error al guardar horario:", error);
          throw new Error(`Error al guardar horario: ${error.message || JSON.stringify(error)}`);
        }

        if (!data || data.length === 0) {
          throw new Error("No se recibió datos del servidor al guardar el horario");
        }

        // El nombre_dia es generado por el servidor, así que ya viene en el registro
        return {
          ...data[0],
          nombre_corto: data[0].nombre_dia ? data[0].nombre_dia.substring(0, 3) : null
        } as HorarioSucursal;
      } catch (error: any) {
        console.error("Error en upsert de horario:", error);
        const errorMessage = error.message || "Error desconocido al guardar el horario";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horarios_sucursales"] });
    },
    onError: (error: any) => {
      console.error("Error en mutación de horario:", error);
    }
  });

  // Eliminar horario
  const deleteMutation = useMutation({
    mutationFn: async (idHorario: string) => {
      try {
        const { error } = await supabase
          .from("mibarber_horarios_sucursales")
          .delete()
          .eq("id_horario", idHorario);

        if (error) {
          console.error("Error al eliminar horario:", error);
          throw error;
        }
      } catch (error) {
        console.error("Error en delete de horario:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horarios_sucursales"] });
    }
  });

  return {
    horarios: horariosQuery.data || [],
    isLoading: horariosQuery.isLoading,
    isError: horariosQuery.isError,
    error: horariosQuery.error,
    upsertHorario: upsertMutation.mutateAsync,
    deleteHorario: deleteMutation.mutateAsync
  };
}