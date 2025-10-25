"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Barbero } from "@/types/db";

// Tipo para las estadísticas de un barbero
export interface BarberoStats {
  id_barbero: number;
  nombre: string;
  turnos_atendidos: number;
  ingresos_generados: number;
  servicios_realizados: number;
  ultimo_turno: string | null;
  especialidades: string[];
}

export function useBarberoStats() {
  const supabase = getSupabaseClient();

  const getBarberoStats = useQuery({
    queryKey: ["barbero-stats"],
    queryFn: async () => {
      try {
        // Obtener todos los barberos
        const { data: barberos, error: barberosError } = await (supabase as any)
          .from("mibarber_barberos")
          .select("id_barbero, nombre, especialidades")
          .order("nombre", { ascending: true });

        if (barberosError) {
          console.error("❌ Error obteniendo barberos:", barberosError);
          throw barberosError;
        }

        if (!barberos || barberos.length === 0) {
          return [] as BarberoStats[];
        }

        // Obtener estadísticas para cada barbero
        const statsPromises = barberos.map(async (barbero: any) => {
          try {
            // Contar turnos atendidos por el barbero (filtrando por ID del barbero y estado completado)
            const { count: citasCount = 0, error: citasError } = await (supabase as any)
              .from("mibarber_citas")
              .select("*", { count: "exact", head: true })
              .eq("barbero", barbero.id_barbero)
              .eq("estado", "completado");

            if (citasError) {
              console.warn(`⚠️ Advertencia obteniendo citas para ${barbero.nombre}:`, citasError);
            }

            // Calcular ingresos generados por el barbero desde la tabla citas (filtrando por ID del barbero y estado completado)
            const { data: citasData = [], error: citasError2 } = await (supabase as any)
              .from("mibarber_citas")
              .select("servicio")
              .eq("barbero", barbero.id_barbero)
              .eq("estado", "completado");

            if (citasError2) {
              console.warn(`⚠️ Advertencia obteniendo citas para ingresos de ${barbero.nombre}:`, citasError2);
            }

            // Obtener precios de servicios para calcular ingresos
            let ingresosGenerados = 0;
            if (citasData.length > 0) {
              // Obtener servicios únicos
              const serviciosUnicos = [...new Set(citasData.map((cita: any) => cita.servicio))];
              
              // Obtener precios de servicios
              const { data: serviciosData = [], error: serviciosError } = await (supabase as any)
                .from("mibarber_servicios")
                .select("nombre, precio")
                .in("nombre", serviciosUnicos);

              if (serviciosError) {
                console.warn(`⚠️ Advertencia obteniendo precios de servicios para ${barbero.nombre}:`, serviciosError);
              } else {
                // Calcular ingresos totales
                const preciosMap = serviciosData.reduce((acc: Record<string, number>, servicio: any) => {
                  acc[servicio.nombre] = servicio.precio || 0;
                  return acc;
                }, {});

                ingresosGenerados = citasData.reduce((sum: number, cita: any) => {
                  return sum + (preciosMap[cita.servicio] || 0);
                }, 0);
              }
            }

            // Contar servicios realizados por el barbero (filtrando por ID del barbero y estado completado)
            const { count: serviciosCount = 0, error: serviciosError } = await (supabase as any)
              .from("mibarber_citas")
              .select("*", { count: "exact", head: true })
              .eq("barbero", barbero.id_barbero)
              .eq("estado", "completado")
              .neq("id_servicio", null);

            if (serviciosError) {
              console.warn(`⚠️ Advertencia obteniendo servicios para ${barbero.nombre}:`, serviciosError);
            }

            // Obtener el último turno atendido por el barbero (filtrando por ID del barbero y estado completado)
            const { data: ultimaCitaData = null, error: ultimaCitaError } = await (supabase as any)
              .from("mibarber_citas")
              .select("fecha, hora")
              .eq("barbero", barbero.id_barbero)
              .eq("estado", "completado")
              .order("fecha", { ascending: false })
              .order("hora", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (ultimaCitaError) {
              console.warn(`⚠️ Advertencia obteniendo última cita para ${barbero.nombre}:`, ultimaCitaError);
            }

            return {
              id_barbero: barbero.id_barbero,
              nombre: barbero.nombre || 'Sin nombre',
              turnos_atendidos: citasCount || 0,
              ingresos_generados: ingresosGenerados || 0,
              servicios_realizados: serviciosCount || 0,
              ultimo_turno: ultimaCitaData ? `${ultimaCitaData.fecha} ${ultimaCitaData.hora}` : null,
              especialidades: Array.isArray(barbero.especialidades) ? barbero.especialidades : []
            };
          } catch (barberoError) {
            console.error(`❌ Error procesando estadísticas para ${barbero.nombre}:`, barberoError);
            // Devolver estadísticas básicas en caso de error
            return {
              id_barbero: barbero.id_barbero,
              nombre: barbero.nombre || 'Sin nombre',
              turnos_atendidos: 0,
              ingresos_generados: 0,
              servicios_realizados: 0,
              ultimo_turno: null,
              especialidades: Array.isArray(barbero.especialidades) ? barbero.especialidades : []
            };
          }
        });

        const stats = await Promise.all(statsPromises);
        return stats as BarberoStats[];
      } catch (error) {
        console.error("❌ Error general obteniendo estadísticas de barberos:", error);
        throw error;
      }
    },
    retry: 2, // Reintentar hasta 2 veces en caso de error
  });

  return {
    stats: getBarberoStats.data,
    isLoading: getBarberoStats.isLoading,
    isError: getBarberoStats.isError,
    error: getBarberoStats.error,
  };
}