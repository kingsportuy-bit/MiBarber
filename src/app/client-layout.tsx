"use client";

import { Providers } from "@/components/Providers";
import { GeneralLayout } from "@/components/GeneralLayout";
import { ConditionalNavBar } from "@/components/ConditionalNavBar";
import { GlobalFiltersProvider } from "@/contexts/GlobalFiltersContext";
import { BottomNav } from "@/components/BottomNav";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { FloatingNewAppointmentButton } from "@/components/FloatingNewAppointmentButton";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Debug: Mostrar la ruta actual en la consola
  console.log("Ruta actual:", pathname);
  
  // Solo mostrar el botón flotante en las rutas de inicio y agenda
  const showFloatingButton = pathname === "/inicio" || pathname === "/agenda";

  return (
    <Providers>
      <GlobalFiltersProvider>
        <ConditionalNavBar />
        <GeneralLayout>
          {children}
        </GeneralLayout>
        <BottomNav />
        <OfflineIndicator />
        {showFloatingButton && <FloatingNewAppointmentButton />}
      </GlobalFiltersProvider>
    </Providers>
  );
}