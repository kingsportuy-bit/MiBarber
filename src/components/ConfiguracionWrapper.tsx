"use client";

import { usePathname } from "next/navigation";

export function ConfiguracionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Verificar si estamos en una página de administración
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Para la página de administración, usar el contenedor principal sin restricciones
  if (isAdminPage) {
    return (
      <div className="w-full flex-grow flex flex-col flex-1 min-w-0">
        {children}
      </div>
    );
  }
  
  return (
    <div className="p-2 md:p-6">
      {children}
    </div>
  );
}