"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, isAdmin, isLoading } = useBarberoAuth();

  // Usar useMemo para evitar renders innecesarios
  const authState = useMemo(() => ({
    isAuthenticated,
    isAdmin,
    isLoading
  }), [isAuthenticated, isAdmin, isLoading]);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    
    // Si no está autenticado, redirigir al login
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push("/login");
    }
    // Si está autenticado pero no es admin, redirigir al dashboard
    else if (!authState.isLoading && authState.isAuthenticated && !authState.isAdmin) {
      router.push("/dashboard");
    }
  }, [authState.isAuthenticated, authState.isAdmin, authState.isLoading, router]);

  // Si estamos en el servidor o aún no se ha montado el componente, mostrar indicador de carga
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }

  // Si está cargando, mostrar un indicador de carga
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }

  // Si no es admin, no mostrar el contenido
  if (!authState.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-4">
            Acceso Restringido
          </h2>
          <p className="text-qoder-dark-text-secondary">
            Esta sección es solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  // Si es admin, mostrar el contenido
  return <>{children}</>;
}