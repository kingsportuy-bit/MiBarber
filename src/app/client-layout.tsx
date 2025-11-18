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

  // Verificar la ruta actual para determinar si mostrar el BottomNav
  useEffect(() => {
    // Verificar si estamos en la vista de chat individual de WhatsApp
    if (typeof window !== 'undefined') {
      if (pathname?.startsWith('/whatsapp') && window.location.hash === '#chat-view') {
        // Estamos en un chat individual de WhatsApp, ocultar el BottomNav
        setShowBottomNav(false);
      } else {
        // En cualquier otro caso, mostrar el BottomNav
        setShowBottomNav(true);
        // Limpiar el hash si no estamos en WhatsApp
        if (!pathname?.startsWith('/whatsapp') && (window.location.hash === '#chat-view' || window.location.hash === '#chat-list')) {
          window.location.hash = '';
        }
      }
    } else {
      // Por defecto, mostrar el BottomNav
      setShowBottomNav(true);
    }
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