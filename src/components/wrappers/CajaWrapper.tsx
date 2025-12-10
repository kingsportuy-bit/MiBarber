'use client';

import { CajaResumenCards } from '@/components/caja/CajaResumenCards';

/**
 * Wrapper que agrega las tarjetas de resumen de caja a cualquier contenido
 * Útil para envolver secciones específicas de una página sin modificar el layout completo
 */
export function CajaWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      {/* Tarjetas de resumen de caja */}
      <CajaResumenCards />
      
      {/* Contenido envuelto */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}