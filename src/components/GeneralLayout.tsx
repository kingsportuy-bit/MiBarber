"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginLayout } from "@/components/layouts/LoginLayout";
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

  // Para la página de registro, no usar ningún layout
  const isRegistroPage = pathname?.startsWith('/registro');

  // Para la página de admin, usar un layout más simple
  const isAdminPage = pathname?.startsWith('/admin');

  // Verificar si estamos en la vista individual de chat de WhatsApp (solo en mÃ³vil)
  useEffect(() => {
    const checkChatView = () => {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 768;
        setIsChatView(isMobile && window.location.hash === '#chat-view');
      }
    };

    // Verificar el estado inicial
    checkChatView();

    // Escuchar cambios en el hash y en el tamaÃ±o de la ventana
    window.addEventListener('hashchange', checkChatView);
    window.addEventListener('resize', checkChatView);

    return () => {
      window.removeEventListener('hashchange', checkChatView);
      window.removeEventListener('resize', checkChatView);
    };
  }, []);

  const handleRefresh = () => {
    // Recargar la página actual
    window.location.reload();
  };

  if (isLoginPage) {
    return <LoginLayout>{children}</LoginLayout>;
  }

  if (isRegistroPage) {
    return <>{children}</>;
  }

  if (isAdminPage) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  const isWhatsapp = pathname?.startsWith('/whatsapp');
  const isWhatsappChatView = isWhatsapp && isChatView;

  // En WhatsApp, siempre queremos sin padding (todo el ancho) y sin el footer de barberox
  return (
    <DefaultLayout
      onRefresh={handleRefresh}
      noPadding={isWhatsapp}
      hideFooter={isWhatsapp}
    >
      {children}
    </DefaultLayout>
  );
}