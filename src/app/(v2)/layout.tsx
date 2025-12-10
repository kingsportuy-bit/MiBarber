'use client';

import './globals-v2.css';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { NavBar } from '@/components/NavBar';
import { BottomNav } from '@/components/BottomNav';
import { QoderFooter } from '@/components/QoderFooter';
import { CurrentDateProvider } from '@/components/shared/CurrentDateProvider';

// Componente para manejar los títulos
function TitleHandler() {
  const [title, setTitle] = useState('Barberox');

  useEffect(() => {
    // Determinar el título basado en la ruta
    const path = window.location.pathname;
    
    if (path.startsWith('/caja')) {
      setTitle('Barberox | Caja');
    } else if (path.startsWith('/estadisticas')) {
      setTitle('Barberox | Estadísticas');
    } else if (path.startsWith('/perfil')) {
      setTitle('Barberox | Perfil');
    } else if (path.startsWith('/agente-ia')) {
      setTitle('Barberox | Agente IA');
    } else if (path.startsWith('/plantilla')) {
      setTitle('Barberox | Plantilla');
    } else {
      setTitle('Barberox');
    }
  }, []);

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TitleHandler />
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
    </>
  );
}