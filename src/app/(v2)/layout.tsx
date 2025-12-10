import './globals-v2.css';
import type { Metadata } from 'next';
import { NavBar } from '@/components/NavBar';
import { BottomNav } from '@/components/BottomNav';
import { QoderFooter } from '@/components/QoderFooter';
import { CurrentDateProvider } from '@/components/shared/CurrentDateProvider';

export const metadata: Metadata = {
  title: 'MiBarber - Sistema V2',
  description: 'Sistema de gestión para barberías',
};

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurrentDateProvider>
      <div className="v2-root">
        <NavBar />
        <main className="v2-main">
          <div className="v2-content">
            {children}
          </div>
        </main>
        <QoderFooter />
        <BottomNav />
      </div>
    </CurrentDateProvider>
  );
}