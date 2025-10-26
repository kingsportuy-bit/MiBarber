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
  
  return (
    <div className={`p-2 md:p-6 ${isAdminPage ? 'max-w-4xl mx-auto' : ''}`}>
      {children}
    </div>
  );
}