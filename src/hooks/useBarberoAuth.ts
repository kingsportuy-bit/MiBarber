"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Barbero } from "@/types/db";

// Valores por defecto para cuando no se puede acceder al contexto
const DEFAULT_AUTH_STATE = {
  isAuthenticated: false,
  isAdmin: false,
  barbero: null,
  idBarberia: null,
  isLoading: false,
  isError: false,
  error: null,
  data: null,
};

export function useBarberoAuth() {
  // Mover useQueryClient al nivel superior del hook
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();
  
  // Verificar si estamos en el cliente
  const isClient = typeof window !== "undefined";

  console.log("useBarberoAuth: Hook initialized");

  const getBarberoAuth = useQuery<
    {
      isAuthenticated: boolean;
      isAdmin: boolean;
      barbero: Barbero | null;
      idBarberia: string | null;
    },
    Error
  >({
    queryKey: ["barberoAuth"],
    queryFn: async () => {
      console.log("useBarberoAuth: queryFn called");

      // Verificar si hay una sesión activa
      if (!isClient) {
        console.log(
          "useBarberoAuth: Running on server side, returning default",
        );
        return {
          isAuthenticated: false,
          isAdmin: false,
          barbero: null,
          idBarberia: null,
        };
      }

      console.log("useBarberoAuth: Running on client side");

      // Verificar sesión en localStorage
      const sessionStr = localStorage.getItem("barber_auth_session");
      console.log("useBarberoAuth: sessionStr from localStorage", sessionStr);

      if (!sessionStr) {
        console.log("useBarberoAuth: No hay sesión en localStorage");
        return {
          isAuthenticated: false,
          isAdmin: false,
          barbero: null,
          idBarberia: null,
        };
      }

      try {
        const sessionData = JSON.parse(sessionStr);
        console.log("useBarberoAuth: Datos de sesión encontrados", sessionData);

        // Verificar si la sesión aún es válida
        if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
          // Sesión expirada, limpiar
          console.log("useBarberoAuth: Sesión expirada, limpiando");
          localStorage.removeItem("barber_auth_session");
          // También eliminar la cookie
          document.cookie =
            "barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          return {
            isAuthenticated: false,
            isAdmin: false,
            barbero: null,
            idBarberia: null,
          };
        }

        // Verificar la estructura de los datos de sesión
        // Puede estar en sessionData directamente o en sessionData.user
        let userData;
        if (sessionData.user && typeof sessionData.user === "object") {
          // Caso 1: Los datos del usuario están en sessionData.user
          userData = sessionData.user;
          console.log(
            "useBarberoAuth: Usando datos de usuario de sessionData.user",
            userData,
          );
        } else if (typeof sessionData === "object" && sessionData.id) {
          // Caso 2: Los datos del usuario están directamente en sessionData
          userData = sessionData;
          console.log(
            "useBarberoAuth: Usando datos de usuario de sessionData directamente",
            userData,
          );
        } else {
          // Caso 3: Estructura de datos inválida
          console.log(
            "useBarberoAuth: Estructura de datos de sesión inválida",
            sessionData,
          );
          localStorage.removeItem("barber_auth_session");
          return {
            isAuthenticated: false,
            isAdmin: false,
            barbero: null,
            idBarberia: null,
          };
        }

        // Verificar que userData tenga las propiedades necesarias
        if (!userData.id) {
          console.log(
            "useBarberoAuth: Datos de usuario inválidos, limpiando - No hay ID de usuario",
          );
          localStorage.removeItem("barber_auth_session");
          return {
            isAuthenticated: false,
            isAdmin: false,
            barbero: null,
            idBarberia: null,
          };
        }

        // Obtener datos completos del barbero de la base de datos
        const { data: barberoDB, error: barberoError } = await supabase
          .from("mibarber_barberos")
          .select("*")
          .eq("id_barbero", userData.id)
          .single();

        if (barberoError) {
          console.error("useBarberoAuth: Error al obtener datos del barbero", barberoError);
          localStorage.removeItem("barber_auth_session");
          return {
            isAuthenticated: false,
            isAdmin: false,
            barbero: null,
            idBarberia: null,
          };
        }

        const barberoData: Barbero = {
          id_barbero: (barberoDB as any).id_barbero,
          nombre: (barberoDB as any).nombre,
          telefono: (barberoDB as any).telefono || "",
          email: (barberoDB as any).email || "",
          especialidades: (barberoDB as any).especialidades || [],
          activo: (barberoDB as any).activo !== undefined ? (barberoDB as any).activo : true,
          nivel_permisos:
            (barberoDB as any).nivel_permisos !== undefined ? (barberoDB as any).nivel_permisos : 2,
          admin: (barberoDB as any).admin !== undefined ? (barberoDB as any).admin : false,
          username: (barberoDB as any).username || "",
          password_hash: (barberoDB as any).password_hash || "",
          id_barberia: (barberoDB as any).id_barberia || null,
          id_sucursal: (barberoDB as any).id_sucursal || null,
          created_at: (barberoDB as any).created_at || new Date().toISOString(),
          updated_at: (barberoDB as any).updated_at || new Date().toISOString(),
        };

        // Determinar si es administrador basado en el campo admin (true = administrador)
        const isAdmin = (barberoDB as any).admin === true;

        console.log("useBarberoAuth - Datos de sesión válidos:", {
          isAuthenticated: true,
          isAdmin,
          barbero: barberoData,
          idBarberia: (barberoDB as any).id_barberia || null,
        });

        return {
          isAuthenticated: true,
          isAdmin: isAdmin,
          barbero: barberoData,
          idBarberia: (barberoDB as any).id_barberia || null,
        };
      } catch (error) {
        // Datos inválidos, limpiar
        console.log(
          "useBarberoAuth: Error parseando datos de sesión, limpiando",
          error,
        );
        localStorage.removeItem("barber_auth_session");
        // También eliminar la cookie
        document.cookie =
          "barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        return {
          isAuthenticated: false,
          isAdmin: false,
          barbero: null,
          idBarberia: null,
          error:
            error instanceof Error ? error : new Error("Error desconocido"),
        };
      }
    },
    staleTime: 0, // No cachear para asegurar que siempre se verifique el estado
    retry: 1, // Reintentar una vez en caso de error
    retryDelay: 1000, // Esperar 1 segundo antes de reintentar
  });

  // Efecto para escuchar cambios en el almacenamiento local
  useEffect(() => {
    console.log("useBarberoAuth: Storage change effect mounted");

    const handleStorageChange = () => {
      console.log("useBarberoAuth: Cambio detectado en localStorage");
      // Invalidar la consulta para que se actualice con los nuevos datos
      try {
        queryClient.invalidateQueries({ queryKey: ["barberoAuth"] });
      } catch (error) {
        console.error("useBarberoAuth: Error invalidating queries", error);
      }
    };

    // Escuchar cambios en localStorage
    if (isClient) {
      window.addEventListener("storage", handleStorageChange);
    }

    // También escuchar el evento personalizado que disparamos al iniciar/cerrar sesión
    const handleAuthChange = () => {
      console.log("useBarberoAuth: Cambio detectado en barberAuthChange");
      try {
        queryClient.invalidateQueries({ queryKey: ["barberoAuth"] });
      } catch (error) {
        console.error("useBarberoAuth: Error invalidating queries", error);
      }
    };

    if (isClient) {
      window.addEventListener("barberAuthChange", handleAuthChange);
    }

    return () => {
      console.log("useBarberoAuth: Cleaning up storage change listeners");
      if (isClient) {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("barberAuthChange", handleAuthChange);
      }
    };
  }, [queryClient, isClient]);

  // Función para iniciar sesión
  const loginMutation = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      console.log("Intentando iniciar sesión con:", { username });

      // Buscar al usuario en la tabla mibarber_barberos por username
      const { data, error: userError } = await supabase
        .from("mibarber_barberos")
        .select("*")
        .eq("username", username)
        .single();

      if (userError || !data) {
        throw new Error("Usuario no encontrado");
      }

      const user = data as Barbero;

      // Verificar la contraseña usando bcrypt
      // Nota: Para usuarios existentes con contraseña en texto plano,
      // se debe migrar primero a bcrypt
      const { verifyPassword } = await import("@/lib/password");

      if (!user.password_hash) {
        throw new Error("Usuario sin contraseña configurada");
      }

      const isValidPassword = await verifyPassword(
        password,
        user.password_hash,
      );

      if (!isValidPassword) {
        throw new Error("Contraseña incorrecta");
      }

      // Crear una sesión de autenticación simulada
      const sessionData = {
        user: {
          id: user.id_barbero,
          email: user.email,
          name: user.nombre,
          username: user.username,
          nivel_permisos: user.nivel_permisos, // Incluir nivel_permisos en la sesión
          admin: user.admin, // Incluir admin en la sesión
          id_barberia: user.id_barberia, // Incluir id_barberia en la sesión
          id_sucursal: user.id_sucursal, // Incluir id_sucursal en la sesión
          telefono: user.telefono, // Incluir telefono en la sesión
          especialidades: user.especialidades || [], // Incluir especialidades en la sesión
        },
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expira en 24 horas
      };

      // Guardar en localStorage para simular sesión persistente
      if (isClient) {
        localStorage.setItem(
          "barber_auth_session",
          JSON.stringify(sessionData),
        );
        // También establecer una cookie para que el middleware pueda detectar la sesión
        document.cookie = `barber_auth_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
      }

      console.log("Autenticación exitosa para:", user.nombre);

      // Disparar evento personalizado para notificar el cambio
      if (isClient) {
        window.dispatchEvent(
          new CustomEvent("barberAuthChange", {
            detail: { user, action: "login" },
          }),
        );
      }

      return {
        user: user,
      };
    },
    onSuccess: () => {
      try {
        // Remover la condición y llamar directamente a invalidateQueries
        queryClient.invalidateQueries({ queryKey: ["barberoAuth"] });
      } catch (error) {
        console.error(
          "useBarberoAuth: Error invalidating queries on login",
          error,
        );
      }
    },
  });

  // Función para cerrar sesión
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Eliminar sesión de localStorage
      if (isClient) {
        localStorage.removeItem("barber_auth_session");
        // También eliminar la cookie
        document.cookie =
          "barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      // Disparar evento personalizado para notificar el cambio
      if (isClient) {
        window.dispatchEvent(
          new CustomEvent("barberAuthChange", {
            detail: { user: null, action: "logout" },
          }),
        );
      }
    },
    onSuccess: () => {
      try {
        if (
          queryClient &&
          typeof queryClient.invalidateQueries === "function"
        ) {
          queryClient.invalidateQueries({ queryKey: ["barberoAuth"] });
        }
      } catch (error) {
        console.error(
          "useBarberoAuth: Error invalidating queries on logout",
          error,
        );
      }
    },
  });

  // Agregar un efecto para forzar la verificación de autenticación al montar el componente
  useEffect(() => {
    console.log("useBarberoAuth: Componente montado, forzando verificación");
    // Forzar una actualización de la consulta de autenticación
    try {
      // Remover la condición y llamar directamente a invalidateQueries
      queryClient.invalidateQueries({ queryKey: ["barberoAuth"] });
    } catch (error) {
      console.error(
        "useBarberoAuth: Error invalidating queries on mount",
        error,
      );
    }
  }, [queryClient]);

  // Asegurar que los valores se devuelvan correctamente
  const isAuthenticated = getBarberoAuth.data?.isAuthenticated ?? false;
  const isAdmin = getBarberoAuth.data?.isAdmin ?? false;
  const barbero = getBarberoAuth.data?.barbero ?? null;
  const idBarberia = getBarberoAuth.data?.idBarberia ?? null;

  console.log("useBarberoAuth: Valores devueltos", {
    isAuthenticated,
    isAdmin,
    barbero,
    idBarberia,
    isLoading: getBarberoAuth.isLoading,
    isError: getBarberoAuth.isError,
    data: getBarberoAuth.data,
  });

  return {
    ...getBarberoAuth,
    isAuthenticated,
    isAdmin,
    barbero,
    idBarberia,
    login: loginMutation,
    logout: logoutMutation,
  };
}