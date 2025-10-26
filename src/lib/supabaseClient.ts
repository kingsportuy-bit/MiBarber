"use client";

import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/logger";

const logger = createLogger("Supabase");

let browserClient: ReturnType<typeof createClient> | undefined;

export function getSupabaseClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validar que las variables de entorno existan
  if (!url || !anon) {
    const error = new Error(
      "Faltan variables de entorno requeridas: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Por favor configura tu archivo .env.local",
    );
    logger.error("❌ Error de configuración:", error.message);
    throw error;
  }

  logger.log("✅ Inicializando cliente Supabase");
  logger.log("📡 URL:", url);

  try {
    browserClient = createClient(url, anon, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    logger.log("🔌 Cliente Supabase creado con configuración de tiempo real");
    return browserClient;
  } catch (error) {
    logger.error("❌ Error creando cliente Supabase:", error);
    throw error;
  }
}

// Exportar el cliente directamente para compatibilidad
export const supabase = getSupabaseClient();
