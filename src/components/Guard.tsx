"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./Providers";

export function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('🔍 Guard: Cambio en loading o user', { loading, user, checked });
    // Marcar como verificado cuando termine la carga
    if (!loading) {
      console.log('✅ Guard: Autenticación verificada');
      setChecked(true);
    }
  }, [loading, user, checked]);

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    console.log('🔍 Guard: Verificando redirección', { checked, user, redirecting });
    if (checked && !user && !redirecting) {
      console.log('❌ Guard: No hay usuario, redirigiendo a login');
      setRedirecting(true);
      router.replace("/login");
    } else if (checked && user) {
      console.log('✅ Guard: Usuario autenticado, permitiendo acceso');
    }
  }, [checked, user, router, redirecting]);

  // Si está cargando o aún no se ha verificado, mostrar pantalla de carga
  if (loading || !checked) {
    console.log('⏳ Guard: Mostrando pantalla de carga', { loading, checked });
    return (
      <div className="min-h-dvh flex items-center justify-center bg-qoder-dark-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qoder-dark-accent-primary mx-auto mb-4"></div>
          <p className="text-qoder-dark-text-secondary">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario y estamos redirigiendo, mostrar mensaje de redirección
  if (!user && redirecting) {
    console.log('❌ Guard: No hay usuario, mostrando pantalla de redirección');
    return (
      <div className="min-h-dvh flex items-center justify-center bg-qoder-dark-bg-primary">
        <div className="text-center">
          <p className="text-qoder-dark-text-secondary">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario, mostrar el contenido
  console.log('✅ Guard: Usuario autenticado, mostrando contenido', user);
  return <>{children}</>;
}