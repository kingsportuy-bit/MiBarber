"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment, PaginatedResponse } from "@/types/db";
import { createLogger } from "@/lib/logger";

const logger = createLogger('usePaginatedCitas');

interface UsePaginatedCitasParams {
  page?: number;
  pageSize?: number;
  filters?: {
    fecha?: string;
    barbero?: string;
    estado?: string;
    sucursalId?: string;
  };
}

export function usePaginatedCitas({
  page = 1,
  pageSize = 20,
  filters = {}
}: UsePaginatedCitasParams = {}) {
  const supabase = getSupabaseClient();

  return useQuery<PaginatedResponse<Appointment>>({
    queryKey: ["citas", "paginated", page, pageSize, filters],
    queryFn: async () => {
      logger.log(`Fetching citas - page: ${page}, pageSize: ${pageSize}`, filters);

      const offset = (page - 1) * pageSize;

      // Construir query base
      let query = supabase
        .from("mibarber_citas")
        .select("*", { count: "exact" });

      // Aplicar filtros
      if (filters.fecha) {
        query = query.eq("fecha", filters.fecha);
      }
      if (filters.barbero) {
        query = query.eq("barbero", filters.barbero);
      }
      if (filters.estado) {
        query = query.eq("estado", filters.estado);
      }
      if (filters.sucursalId) {
        query = query.eq("id_sucursal", filters.sucursalId);
      }

      // Aplicar paginación y ordenamiento
      query = query
        .order("fecha", { ascending: false })
        .order("hora", { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching citas:", error);
        throw error;
      }

      const totalPages = count ? Math.ceil(count / pageSize) : 0;

      return {
        data: (data as Appointment[]) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages,
      };
    },
  });
}
