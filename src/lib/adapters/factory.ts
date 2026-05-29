import { SupabaseAppointmentReadRepository } from "./supabase/appointment-read.repository";
import { HttpPanelActionRepository } from "./api/panel-action.repository";
import type { IAppointmentReadRepository, IPanelActionRepository } from "./contracts";

// Configuración centralizada para intercambiar implementaciones
export const ADAPTER_CONFIG = {
  // Las lecturas del panel temporalmente van a Supabase
  appointmentsRead: "supabase", 
  
  // Las acciones del panel SIEMPRE van al core (webhook)
  panelAction: "core_api",
};

export function getAppointmentReadRepository(): IAppointmentReadRepository {
  if (ADAPTER_CONFIG.appointmentsRead === "supabase") {
    return new SupabaseAppointmentReadRepository();
  }
  // Fallback seguro
  return new SupabaseAppointmentReadRepository();
}

export function getPanelActionRepository(): IPanelActionRepository {
  if (ADAPTER_CONFIG.panelAction === "core_api") {
    return new HttpPanelActionRepository();
  }
  // Nunca hay fallback a Supabase para acciones del panel
  return new HttpPanelActionRepository();
}
