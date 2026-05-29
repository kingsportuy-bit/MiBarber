// Configuración dinámica del adaptador de origen de datos para MiBarber

export type DataSource = "supabase" | "core_api";

export const ADAPTER_CONFIG: Record<string, DataSource> = {
  auth: "supabase",         // 'supabase' o 'core_api'
  appointments: "supabase", // TODO: cambiar a "core_api" cuando Codex confirme el endpoint /v1/appointments listo
  services: "supabase",     // 'supabase' o 'core_api'
  barbers: "supabase",      // 'supabase' o 'core_api'
  clients: "supabase",      // 'supabase' o 'core_api'
  products: "supabase",     // Local temporal (hasta que Codex tenga lista la API de productos)
  stats: "supabase",        // Local temporal (hasta que Codex tenga lista la API de estadísticas)
};

// Determina si usar la API Gateway global para todos los módulos compatibles
export const isCoreApiEnabled = (moduleName: keyof typeof ADAPTER_CONFIG): boolean => {
  return ADAPTER_CONFIG[moduleName] === "core_api";
};
