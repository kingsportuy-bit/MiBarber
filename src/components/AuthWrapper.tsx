"use client";

import { usePathname } from "next/navigation";

export function AuthWrapper({ 
  children
}: { 
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Para simplificar, vamos a permitir que todas las rutas se rendericen
  // El middleware se encargará de las redirecciones
  return <>{children}</>;
}
