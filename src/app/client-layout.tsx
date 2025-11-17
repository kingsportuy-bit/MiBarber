"use client";

import { Providers } from "@/components/Providers";
import { GeneralLayout } from "@/components/GeneralLayout";
import { ConditionalNavBar } from "@/components/ConditionalNavBar";
import { GlobalFiltersProvider } from "@/contexts/GlobalFiltersContext";
import { BottomNav } from "@/components/BottomNav";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { FloatingNewAppointmentButton } from "@/components/FloatingNewAppointmentButton";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [showBottomNav, setShowBottomNav] = useState(true);
  
  // Debug: Mostrar la ruta actual en la consola
  console.log("Ruta actual:", pathname);
  
  // Solo mostrar el botón flotante en las rutas de inicio y agenda
  const showFloatingButton = pathname === "/inicio" || pathname === "/agenda";

  // Escuchar el evento personalizado de cambio de vista en WhatsApp
  useEffect(() => {
    const handleWhatsAppViewChange = (event: CustomEvent) => {
      const { showChatList } = event.detail;
      // Si estamos en la ruta de WhatsApp y no estamos mostrando la lista de chats,
      // ocultar el BottomNav
      if (pathname?.startsWith('/whatsapp') && !showChatList) {
        setShowBottomNav(false);
      } else {
        setShowBottomNav(true);
      }
    };

    // Añadir el listener del evento
    window.addEventListener('whatsappChatViewChange', handleWhatsAppViewChange as EventListener);
    
    // Limpiar el listener al desmontar
    return () => {
      window.removeEventListener('whatsappChatViewChange', handleWhatsAppViewChange as EventListener);
    };
  }, [pathname]);

  return (
    <Providers>
      <GlobalFiltersProvider>
        <ConditionalNavBar />
        <GeneralLayout>
          {children}
        </GeneralLayout>
        {showBottomNav && <BottomNav />}
        <OfflineIndicator />
        {showFloatingButton && <FloatingNewAppointmentButton />}
      </GlobalFiltersProvider>
    </Providers>
  );
}