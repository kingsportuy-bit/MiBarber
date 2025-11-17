"use client";

import { QoderFooter } from "@/components/QoderFooter";
import { ConfiguracionWrapper } from "@/components/ConfiguracionWrapper";
import { usePathname } from "next/navigation";
import { PullToRefresh } from "@/components/PullToRefresh";

export function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Para la página de login, usar un layout más simple
  const isLoginPage = pathname?.startsWith('/login');
  
  // Para la página de admin, usar un layout más simple
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Para la página de WhatsApp, usar un layout especial
  const isWhatsAppPage = pathname?.startsWith('/whatsapp');
  
  const handleRefresh = () => {
    // Recargar la página actual
    window.location.reload();
  };
  
  if (isLoginPage) {
    return (
      <div className="flex flex-col pb-16 md:pb-0" style={{ minHeight: '100vh' }}>
        <div className="flex-grow flex flex-col justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </div>
        <QoderFooter />
        {/* Espacio transparente para el menú inferior en móviles */}
        <div className="h-16 md:hidden bg-transparent"></div>
      </div>
    );
  }
  
  if (isAdminPage) {
    return (
      <>
        <div className="flex-grow pb-16 md:pb-0">
          {children}
        </div>
        <QoderFooter />
        {/* Espacio transparente para el menú inferior en móviles */}
        <div className="h-16 md:hidden bg-transparent"></div>
      </>
    );
  }
  
  if (isWhatsAppPage) {
    return (
      <div className="flex flex-col h-screen w-full min-w-0 pb-16 md:pb-0">
        {children}
        {/* Espacio transparente para el menú inferior en móviles */}
        <div className="h-16 md:hidden bg-transparent"></div>
      </div>
    );
  }
  
  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="dashboard pb-16 md:pb-0">
        <div className="dashboard-content">
          <ConfiguracionWrapper>
            <div className="flex-grow flex flex-col flex-1 min-w-0">
              {children}
            </div>
          </ConfiguracionWrapper>
        </div>
        <QoderFooter />
        {/* Espacio transparente para el menú inferior en móviles */}
        <div className="h-16 md:hidden bg-transparent"></div>
      </div>
    </PullToRefresh>
  );
}
