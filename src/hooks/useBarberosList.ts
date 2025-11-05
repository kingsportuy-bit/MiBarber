import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Barbero } from "@/types/db";

export function useBarberosList(idBarberia?: string | null, idSucursal?: string | null) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["barberos-list", idBarberia, idSucursal],
    queryFn: async (): Promise<Barbero[]> => {
      console.log('═══════════════════════════════════════════');
      console.log('🔍 useBarberosList - queryFn ejecutado');
      console.log('═══════════════════════════════════════════');
      console.log('🔍 idBarberia recibido:', idBarberia);
      console.log('🔍 idSucursal recibido:', idSucursal);
      console.log('🔍 Tipo de idBarberia:', typeof idBarberia);
      console.log('🔍 Tipo de idSucursal:', typeof idSucursal);

      // Si no tenemos idBarberia, devolver array vacío
      if (!idBarberia) {
        console.log('⚠️ No hay idBarberia, devolviendo array vacío');
        console.log('═══════════════════════════════════════════');
        return [];
      }

      let query = (supabase as any)
        .from("mibarber_barberos")
        .select("*")
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (idBarberia) {
        console.log('✅ Filtrando por idBarberia:', idBarberia);
        query = query.eq("id_barberia", idBarberia);
      } else {
        console.warn('⚠️ idBarberia es null/undefined - NO SE FILTRA POR BARBERÍA');
      }

      if (idSucursal) {
        console.log('✅ Filtrando por idSucursal:', idSucursal);
        query = query.eq("id_sucursal", idSucursal);
      } else {
        console.warn('⚠️ idSucursal es null/undefined - NO SE FILTRA POR SUCURSAL');
      }

      console.log('🔍 Ejecutando query a Supabase...');
      const { data, error } = await query;

      console.log('🔍 Respuesta de Supabase:');
      console.log(' - Data length:', data?.length);
      console.log(' - Error:', error);
      if (data && data.length > 0) {
        console.log(' - Primer barbero:', {
          nombre: data[0].nombre,
          id_barberia: data[0].id_barberia,
          id_sucursal: data[0].id_sucursal
        });
      }
      console.log('═══════════════════════════════════════════');

      if (error) {
        console.error("❌ Error obteniendo lista de barberos:", error);
        throw error;
      }

      return data as Barbero[];
    },
    enabled: !!idBarberia, // Solo ejecutar si hay idBarberia
    staleTime: 0, // ← Cambiar de 5 * 60 * 1000 a 0
  });
}