'use client';

import { CajaResumenCards } from '@/components/caja/CajaResumenCards';
import { DefaultLayout } from '@/components/layouts/DefaultLayout';

/**
 * Layout que incluye las tarjetas de resumen de caja
 * Se puede usar en lugar del DefaultLayout cuando se necesite mostrar
 * las tarjetas de caja en la parte superior de la página
 */
export function CajaLayout({ 
  children,
  onRefresh
}: { 
  children: React.ReactNode;
  onRefresh: () => void;
}) {
  return (
    <DefaultLayout onRefresh={onRefresh}>
      <div className="w-full">
        {/* Tarjetas de resumen de caja */}
        <div className="px-4 pt-4">
          <CajaResumenCards />
        </div>
        
        {/* Contenido principal */}
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </DefaultLayout>
  );
}