'use client';

import { usePathname } from 'next/navigation';
import { Providers } from '@/components/Providers';
import { GlobalFiltersProvider } from '@/contexts/GlobalFiltersContext';
import { ConditionalNavBar } from '@/components/ConditionalNavBar';
import { GeneralLayout } from '@/components/GeneralLayout';
import { BottomNav } from '@/components/BottomNav';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { FloatingNewAppointmentButton } from '@/components/FloatingNewAppointmentButton';
import { Portal } from '@radix-ui/react-portal';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Detectar rutas V2
  const v2Routes = ['/perfil', '/estadisticas', '/caja', '/agente-ia', '/plantilla', '/v2/inicio-v2'];
  const isV2Route = v2Routes.some(route => pathname?.startsWith(route));

  if (isV2Route) {
    return (
      <Providers>
        <GlobalFiltersProvider>
          {children}
        </GlobalFiltersProvider>
      </Providers>
    );
  }

  // Mostrar el botón flotante solo en la página de inicio
  const showFloatingButton = pathname === '/inicio/'; 

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
        <Portal />
      </GlobalFiltersProvider>
    </Providers>
  );
}