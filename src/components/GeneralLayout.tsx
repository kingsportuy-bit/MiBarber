"use client";

import { QoderFooter } from "@/components/QoderFooter";
import { ConfiguracionWrapper } from "@/components/ConfiguracionWrapper";
import { usePathname } from "next/navigation";

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
  
  if (isLoginPage) {
    return (
      <div className="flex flex-col" style={{ minHeight: '100vh' }}>
        <div className="flex-grow flex flex-col justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </div>
        <QoderFooter />
      </div>
    );
  }
  
  if (isAdminPage) {
    return (
      <>
        {children}
        <QoderFooter />
      </>
    );
  }
  
  if (isWhatsAppPage) {
    return (
      <div className="flex flex-col h-screen w-full min-w-0">
        {children}
      </div>
    );
  }
  
  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <ConfiguracionWrapper>
          <div className="flex-grow flex flex-col flex-1 min-w-0">
            {children}
          </div>
        </ConfiguracionWrapper>
      </div>
      <QoderFooter />
    </div>
  );
}