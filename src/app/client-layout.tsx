'use client';

import { usePathname } from 'next/navigation';
import { Providers } from '@/components/Providers';
import { GlobalFiltersProvider } from '@/contexts/GlobalFiltersContext';
import { CurrentDateProvider } from '@/components/shared/CurrentDateProvider';
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

  // Mostrar el botón flotante solo en la página de inicio
  const showFloatingButton = pathname === '/inicio/';

  return (
    <Providers>
      <GlobalFiltersProvider>
        <CurrentDateProvider>
          <ConditionalNavBar />
          <GeneralLayout>
            {children}
          </GeneralLayout>
          <BottomNav />
          <OfflineIndicator />
          <Portal />
        </CurrentDateProvider>
      </GlobalFiltersProvider>
    </Providers>
  );
}