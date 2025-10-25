import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { CajaRecord } from "@/types/db";

export function useCajaRecordsDirect({ 
  desde, 
  hasta, 
  barberoId,
  sucursalId
}: { 
  desde?: string; 
  hasta?: string; 
  barberoId?: number;
  sucursalId?: number;
}) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["cajaRecordsDirect", { desde, hasta, barberoId, sucursalId }],
    queryFn: async () => {
      // Obtener los registros de caja directamente
      let q = (supabase as any)
        .from("mibarber_caja")
        .select(`
          *,
          mibarber_citas!left(id_cita, cliente_nombre, servicio)
        `)
        .order("fecha", { ascending: false });

      if (desde) {
        q = q.gte("fecha", desde);
      }
      
      if (hasta) {
        // Agregar un día a la fecha hasta para incluir todo el día
        const toDate = new Date(hasta);
        toDate.setDate(toDate.getDate() + 1);
        q = q.lt("fecha", toDate.toISOString());
      }
      
      // Si se filtra por barbero, necesitamos hacer un join con la tabla de citas
      if (barberoId) {
        q = q.eq("barbero_id", barberoId);
      }
      
      // Si se filtra por sucursal
      if (sucursalId) {
        q = q.eq("id_sucursal", sucursalId);
      }

      const { data, error } = await q;
      
      if (error) {
        console.error("❌ Error consultando registros de caja:", error);
        throw error;
      }
      
      // Obtener nombres de barberos
      const barberoIds = [...new Set(data.map((record: any) => record.barbero_id).filter(Boolean))];
      let barberoNames: Record<number, string> = {};
      
      if (barberoIds.length > 0) {
        const { data: barberosData, error: barberosError } = await (supabase as any)
          .from("mibarber_barberos")
          .select("id_barbero, nombre")
          .in("id_barbero", barberoIds);
        
        if (!barberosError && barberosData) {
          barberoNames = barberosData.reduce((acc: any, barbero: any) => {
            acc[barbero.id_barbero] = barbero.nombre;
            return acc;
          }, {});
        }
      }
      
      // Mapear los datos para incluir información adicional
      const records = data.map((record: any) => ({
        ...record,
        cliente_nombre: record.mibarber_citas?.cliente_nombre || record.id_cliente || "-",
        servicio: record.mibarber_citas?.servicio || record.servicio || "-",
        barbero_nombre: barberoNames[record.barbero_id] || (record.barbero_id !== null && record.barbero_id !== undefined ? record.barbero_id.toString() : ""),
        metodo_pago: record.metodo_pago || ""
      }));
      
      const total = records.reduce((acc: number, record: any) => acc + (record.monto || 0), 0);
      
      return { records, total };
    },
  });
}