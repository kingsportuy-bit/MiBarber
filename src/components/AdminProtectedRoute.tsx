"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, isAdmin, isLoading } = useBarberoAuth();

  useEffect(() => {
    setIsClient(true);
    
    // Si no está autenticado, redirigir al login
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    // Si está autenticado pero no es admin, redirigir al dashboard
    else if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Si estamos en el servidor o aún no se ha montado el componente, no renderizar nada
  if (!isClient) {
    return null;
  }

  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }

  // Si no es admin, no mostrar el contenido
  if (!isAdmin) {
    return null;
  }

  // Si es admin, mostrar el contenido
  return <>{children}</>;
}