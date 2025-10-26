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
        
        // Si necesitamos los nombres de los días, los obtenemos por separado
        const { data: diasData, error: diasError } = await supabase
          .from("mibarber_dias_semana")
          .select("id_dia, nombre_dia, nombre_corto");
        
        if (diasError) {
          console.error("Error al obtener días de la semana:", diasError);
          // Devolver horarios sin nombres de días si hay error
          return data as HorarioSucursal[];
        }
        
        // Mapear los datos para incluir los nombres de los días
        const diasMap = diasData.reduce((acc: any, dia: any) => {
          acc[dia.id_dia] = {
            nombre_dia: dia.nombre_dia,
            nombre_corto: dia.nombre_corto
          };
          return acc;
        }, {});
        
        // Agregar los nombres de los días a cada horario
        return data.map((horario: any) => ({
          ...horario,
          nombre_dia: diasMap[horario.id_dia]?.nombre_dia || null,
          nombre_corto: diasMap[horario.id_dia]?.nombre_corto || null
        })) as HorarioSucursal[];
      } catch (error) {
        console.error("Error en fetch de horarios:", error);
        return [];
      }
    },
    enabled: !!idSucursal && idSucursal !== "",
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
        
        // Obtener el nombre del día para el horario guardado
        const { data: diaData, error: diaError } = await supabase
          .from("mibarber_dias_semana")
          .select("nombre_dia, nombre_corto")
          .eq("id_dia", data[0].id_dia)
          .single();
        
        if (diaError) {
          console.warn("No se pudo obtener el nombre del día:", diaError);
          return data[0] as HorarioSucursal;
        }
        
        // Devolver el horario con los nombres de los días
        return {
          ...data[0],
          nombre_dia: diaData.nombre_dia || null,
          nombre_corto: diaData.nombre_corto || null
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