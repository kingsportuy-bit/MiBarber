"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Client, PaginatedResponse } from "@/types/db";
import { createLogger } from "@/lib/logger";

const logger = createLogger('usePaginatedClientes');

interface UsePaginatedClientesParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sucursalId?: string;
}

export function usePaginatedClientes({
  page = 1,
  pageSize = 20,
  searchTerm,
  sucursalId
}: UsePaginatedClientesParams = {}) {
  const supabase = getSupabaseClient();

  return useQuery<PaginatedResponse<Client>>({
    queryKey: ["clientes", "paginated", page, pageSize, searchTerm, sucursalId],
    queryFn: async () => {
      logger.log(`Fetching clientes - page: ${page}, pageSize: ${pageSize}`, { searchTerm, sucursalId });

      const offset = (page - 1) * pageSize;

      // Construir query base
      let query = supabase
        .from("mibarber_clientes")
        .select("*", { count: "exact" });

      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`nombre.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      if (sucursalId) {
        query = query.eq("id_sucursal", sucursalId);
      }

      // Aplicar paginación y ordenamiento
      query = query
        .order("fecha_creacion", { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching clientes:", error);
        throw error;
      }

      const totalPages = count ? Math.ceil(count / pageSize) : 0;

      return {
        data: (data as Client[]) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages,
      };
    },
  });
}
