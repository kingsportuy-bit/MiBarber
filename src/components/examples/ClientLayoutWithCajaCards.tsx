'use client';

import { CajaResumenCards } from '@/components/caja/CajaResumenCards';

/**
 * Ejemplo de cómo integrar las tarjetas de caja en el layout cliente
 * Este componente muestra cómo se pueden insertar las tarjetas de caja
 * en cualquier parte de la aplicación donde se use el layout cliente
 */
export function ClientLayoutWithCajaCards({ children }: { children: React.ReactNode }) {
  return (
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
  );
}