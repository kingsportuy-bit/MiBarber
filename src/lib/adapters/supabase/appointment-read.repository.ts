import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from "@/types/db";
import type { IAppointmentReadRepository } from "../contracts";

export class SupabaseAppointmentReadRepository implements IAppointmentReadRepository {
  private supabase = getSupabaseClient();

  async listar(params: {
    sucursalId?: string;
    fecha?: string;
    barberoId?: string;
  }): Promise<Appointment[]> {
    let query = (this.supabase as any)
      .from("mibarber_citas")
      .select("*")
      .order("hora", { ascending: true });

    if (params.sucursalId) {
      query = query.eq("id_sucursal", params.sucursalId);
    }
    if (params.fecha) {
      query = query.eq("fecha", params.fecha);
    }
    if (params.barberoId) {
      query = query.eq("barbero", params.barberoId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async listarPorRango(params: {
    sucursalId?: string;
    fechaInicio?: string;
    fechaFin?: string;
    barberoId?: string;
  }): Promise<Appointment[]> {
    let query = (this.supabase as any)
      .from("mibarber_citas")
      .select("*")
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (params.sucursalId) query = query.eq("id_sucursal", params.sucursalId);
    if (params.fechaInicio) query = query.gte("fecha", params.fechaInicio);
    if (params.fechaFin) query = query.lte("fecha", params.fechaFin);
    if (params.barberoId) query = query.eq("barbero", params.barberoId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}
