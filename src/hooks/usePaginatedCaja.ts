"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { CajaRecord, PaginatedResponse, CajaFilters } from "@/types/db";
import { createLogger } from "@/lib/logger";

const logger = createLogger('usePaginatedCaja');

interface UsePaginatedCajaParams extends CajaFilters {
  page?: number;
  pageSize?: number;
}

export function usePaginatedCaja({
  page = 1,
  pageSize = 50,
  desde,
  hasta,
  barbero,
  sucursalId,
  metodoPago,
  tipo
}: UsePaginatedCajaParams = {}) {
  const supabase = getSupabaseClient();

  return useQuery<PaginatedResponse<CajaRecord> & { totalMonto: number }>({
    queryKey: ["caja", "paginated", page, pageSize, desde, hasta, barbero, sucursalId, metodoPago, tipo],
    queryFn: async () => {
      logger.log(`Fetching caja - page: ${page}, pageSize: ${pageSize}`, { desde, hasta, barbero, sucursalId });

      const offset = (page - 1) * pageSize;

      // Construir query base
      let query = supabase
        .from("mibarber_caja")
        .select("*", { count: "exact" });

      // Aplicar filtros
      if (desde) {
        query = query.gte("fecha", `${desde}T00:00:00`);
      }
      if (hasta) {
        query = query.lte("fecha", `${hasta}T23:59:59`);
      }
      if (barbero) {
        query = query.eq("barbero", barbero);
      }
      if (sucursalId) {
        query = query.eq("id_sucursal", sucursalId);
      }
      if (metodoPago) {
        query = query.eq("metodo_pago", metodoPago);
      }
      if (tipo) {
        query = query.eq("tipo", tipo);
      }

      // Aplicar paginación y ordenamiento
      query = query
        .order("fecha", { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching caja:", error);
        throw error;
      }

      // Calcular total de montos (respetando tipo ingreso/egreso)
      const totalMonto = (data as CajaRecord[])?.reduce((sum, record) => {
        return sum + (record.tipo === 'ingreso' ? record.monto : -record.monto);
      }, 0) || 0;

      const totalPages = count ? Math.ceil(count / pageSize) : 0;

      return {
        data: (data as CajaRecord[]) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages,
        totalMonto,
      };
    },
  });
}
