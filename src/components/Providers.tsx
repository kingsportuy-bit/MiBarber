"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";

const logger = createLogger("Providers");

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a Providers");
  }
  return context;
}

// Crear QueryClient fuera del componente para evitar recreaciones
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
      retry: 1,
      refetchOnWindowFocus: false, // Evitar refetches innecesarios
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.log("Iniciando verificación de autenticación");

    // Verificar si hay sesión de barbero en localStorage
    const checkBarberoSession = () => {
      if (typeof window === "undefined") return null;

      const sessionStr = localStorage.getItem("barber_auth_session");
      if (!sessionStr) return null;

      try {
        const sessionData = JSON.parse(sessionStr);
        // Verificar si la sesión está expirada
        if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
          localStorage.removeItem("barber_auth_session");
          return null;
        }
        return sessionData.user;
      } catch {
        localStorage.removeItem("barber_auth_session");
        return null;
      }
    };

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        // Verificar sesión de barbero primero (sistema principal)
        const barberoUser = checkBarberoSession();
        if (barberoUser) {
          logger.log("Usuario barbero autenticado");
          setUser(barberoUser as any);
          setLoading(false);
          return;
        }

        // Si no hay sesión de barbero, verificar Supabase Auth
        const {
          data: { session },
        } = await supabase.auth.getSession();
        logger.log("Sesión de Supabase:", session ? "Activa" : "Inactiva");
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        logger.error("Error obteniendo sesión:", error);
        setUser(null);
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios en autenticación de barbero
    const handleBarberoAuthChange = () => {
      logger.log("Cambio detectado en autenticación de barbero");
      const barberoUser = checkBarberoSession();
      setUser(barberoUser as any);
      if (loading) {
        setLoading(false);
      }
    };

    // Escuchar cambios de autenticación de Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.log("Cambio de estado de autenticación Supabase:", event);
      // Solo actualizar si no hay sesión de barbero activa
      if (!checkBarberoSession()) {
        setUser(session?.user ?? null);
      }
      if (loading) {
        setLoading(false);
      }
    });

    // Escuchar cambios en autenticación de barbero
    if (typeof window !== "undefined") {
      window.addEventListener("barberAuthChange", handleBarberoAuthChange);
    }

    // Fallback para asegurar que loading se establezca en false
    const timer = setTimeout(() => {
      if (loading) {
        logger.warn("Timeout alcanzado, forzando loading a false");
        setLoading(false);
      }
    }, 3000);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("barberAuthChange", handleBarberoAuthChange);
      }
      clearTimeout(timer);
    };
  }, [loading]);

  const signOut = async () => {
    logger.log("Cerrando sesión");

    // Limpiar sesión de barbero si existe
    if (typeof window !== "undefined") {
      localStorage.removeItem("barber_auth_session");
      document.cookie =
        "barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.dispatchEvent(new CustomEvent("barberAuthChange"));
    }

    // También cerrar sesión de Supabase si existe
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signOut,
  };

  logger.log(
    "Estado actual - loading:",
    loading,
    "user:",
    user ? "Autenticado" : "No autenticado",
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}
