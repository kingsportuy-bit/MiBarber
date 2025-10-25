"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Verificar si el usuario está autenticado revisando directamente el localStorage
    const sessionStr = localStorage.getItem('barber_auth_session');
    let isAuthenticated = false;
    
    if (sessionStr) {
      try {
        const sessionData = JSON.parse(sessionStr);
        // Verificar si la sesión aún es válida
        if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
          isAuthenticated = true;
        } else {
          // Sesión expirada, limpiar
          localStorage.removeItem('barber_auth_session');
        }
      } catch (error) {
        // Datos inválidos, limpiar
        localStorage.removeItem('barber_auth_session');
      }
    }
    
    if (isAuthenticated) {
      // Si está autenticado, redirigir al dashboard de mibarber
      router.push('/mibarber');
    } else {
      // Si no está autenticado, redirigir a la página de login
      router.push('/login');
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-qoder-dark-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
    </div>
  );
}