"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginLayout } from "@/components/layouts/LoginLayout";
import { WhatsAppLayout } from "@/components/layouts/WhatsAppLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { DefaultLayout } from "@/components/layouts/DefaultLayout";

export function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isChatView, setIsChatView] = useState(false);
  
  // Para la página de login, usar un layout más simple
  const isLoginPage = pathname?.startsWith('/login');
  
  // Para la página de admin, usar un layout más simple
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Para la página de WhatsApp, usar un layout especial
  const isWhatsAppPage = pathname?.startsWith('/whatsapp');
  
  // Verificar si estamos en la vista individual de chat de WhatsApp
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        setIsChatView(window.location.hash === '#chat-view');
      }
    };
    
    // Verificar el hash inicial
    handleHashChange();
    
    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  const handleRefresh = () => {
    // Recargar la página actual
    window.location.reload();
  };
  
  if (isLoginPage) {
    return <LoginLayout>{children}</LoginLayout>;
  }
  
  if (isAdminPage) {
    return <AdminLayout>{children}</AdminLayout>;
  }
  
  if (isWhatsAppPage) {
    return <WhatsAppLayout>{children}</WhatsAppLayout>;
  }
  
  return <DefaultLayout onRefresh={handleRefresh}>{children}</DefaultLayout>;
}