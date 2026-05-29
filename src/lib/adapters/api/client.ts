// Cliente HTTP nativo usando fetch (elimina dependencias externas como axios y reduce el bundle)

const BASE_URL = process.env.NEXT_PUBLIC_BARBEROX_API_URL || "https://api.barberox.uy/v1";

interface FetchConfig extends RequestInit {
  params?: Record<string, any>;
}

// Función auxiliar para construir URL con query strings
function buildUrl(path: string, params?: Record<string, any>): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        url.searchParams.append(key, String(params[key]));
      }
    });
  }
  return url.toString();
}

// Interceptor y manejador de peticiones HTTP nativo
async function request(path: string, config: FetchConfig = {}): Promise<any> {
  const { params, headers = {}, ...restConfig } = config;
  const correlationId = `FE-${crypto.randomUUID()}`;

  // 1. Construir cabeceras por defecto
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Correlation-ID": correlationId,
  };

  // 2. Extraer y adjuntar token JWT desde localStorage
  if (typeof window !== "undefined") {
    try {
      const sessionStr = localStorage.getItem("barber_auth_session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const token = session.token || session.accessToken || session.user?.token;
        if (token) {
          defaultHeaders["Authorization"] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn("⚠️ No se pudo inyectar el token JWT de la sesión:", error);
    }
  }

  // Combinar headers configurados
  const mergedHeaders = { ...defaultHeaders, ...headers } as HeadersInit;

  const url = buildUrl(path, params);

  try {
    const response = await fetch(url, {
      ...restConfig,
      headers: mergedHeaders,
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      // Normalizar errores del ecosistema Barberox
      const apiError = data || {};
      const normalizedError = {
        success: false,
        message: apiError.message || `Error en la petición: ${response.statusText}`,
        errors: apiError.errors || [
          {
            field: "http",
            code: `HTTP_${response.status}`,
            message: response.statusText,
          },
        ],
        correlationId,
        status: response.status,
      };
      throw normalizedError;
    }

    // Si la respuesta viene envuelta en el formato estándar del ecosistema
    if (data && data.success !== undefined) {
      return data;
    }

    return {
      success: true,
      data,
      errors: [],
      meta: null,
    };
  } catch (error: any) {
    if (error.correlationId) {
      throw error; // Ya está normalizado
    }

    const normalizedError = {
      success: false,
      message: "Error de red o conexión al Core de Barberox",
      errors: [
        {
          field: "network",
          code: "CONNECTION_FAILED",
          message: error.message || "No se pudo establecer conexión",
        },
      ],
      correlationId,
      status: 500,
    };

    console.error(`💥 [API Network Error] Correlation ID: ${correlationId}`, normalizedError);
    throw normalizedError;
  }
}

// API cliente expuesta con interfaz consistente con Axios
export const apiClient = {
  get: (path: string, config?: FetchConfig) =>
    request(path, { ...config, method: "GET" }),
  post: (path: string, body: any, config?: FetchConfig) =>
    request(path, {
      ...config,
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (path: string, body: any, config?: FetchConfig) =>
    request(path, {
      ...config,
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (path: string, config?: FetchConfig) =>
    request(path, { ...config, method: "DELETE" }),
};
