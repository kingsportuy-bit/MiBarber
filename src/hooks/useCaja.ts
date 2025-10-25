"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from "@/types/db";

export function useCaja({ desde, hasta, barbero, sucursalId }: { desde?: string; hasta?: string; barbero?: number; sucursalId?: number }) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["caja", { desde, hasta, barbero, sucursalId }],
    queryFn: async () => {
      console.log("🔍 Iniciando consulta de caja con filtros:", { desde, hasta, barbero, sucursalId });
      
      // Primero obtener las citas que cumplen con los filtros
      let citasQuery = (supabase as any)
        .from("mibarber_citas")
        .select("id_cita, fecha, hora, cliente_nombre, servicio, ticket, nro_factura, barbero")
        .not("ticket", "is", null)
        .eq("estado", "completado")
        .limit(1000);
        
      // Aplicar filtros de citas
      console.log("🔍 Aplicando filtros a la consulta de citas...");
      if (barbero) {
        console.log("🔍 Filtrando por barbero ID:", barbero);
        citasQuery = citasQuery.eq("barbero", barbero);
      }
      if (desde) {
        console.log("🔍 Filtrando desde fecha:", desde);
        citasQuery = citasQuery.gte("fecha", desde);
      }
      if (hasta) {
        console.log("🔍 Filtrando hasta fecha:", hasta);
        citasQuery = citasQuery.lte("fecha", hasta);
      }
      if (sucursalId) {
        console.log("🔍 Filtrando por sucursal ID:", sucursalId);
        citasQuery = citasQuery.eq("id_sucursal", sucursalId);
      }
      
      const { data: citasData, error: citasError } = await citasQuery;
      if (citasError) {
        console.error("❌ Error consultando citas para caja:", citasError);
        throw citasError;
      }
      
      console.log(`✅ Consulta de citas exitosa: ${citasData?.length || 0} registros encontrados`);
      
      const rows = (citasData as Pick<Appointment, "id_cita" | "fecha" | "hora" | "cliente_nombre" | "servicio" | "ticket" | "nro_factura" | "barbero">[]);
      const total = rows.reduce((acc, r) => acc + (r.ticket || 0), 0);
      return { rows, total };
    },
  });
}