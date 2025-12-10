'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEstadisticasCaja } from '@/hooks/useCaja';
import { TarjetaResumen } from '@/components/caja/v2/TarjetaResumen';
import type { FiltrosCaja } from '@/types/caja';

/**
 * Componente que muestra las tarjetas de resumen de caja (Ingresos, Gastos, Balance)
 * con las letras identificadoras I, G, B respectivamente
 */
export function CajaResumenCards() {
  const { idBarberia, isAdmin } = useAuth();
  const esAdmin = isAdmin;

  // Estado de filtros para obtener estadísticas
  const [filtros, setFiltros] = useState<FiltrosCaja>({
    idbarberia: idBarberia || '',
    fechaInicio: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Primer día del mes
    fechaFin: new Date().toISOString().split('T')[0], // Hoy
  });

  // Obtener estadísticas de caja
  const { data: estadisticas, isLoading: loadingEstadisticas } = useEstadisticasCaja(filtros);

  // Validación de datos
  if (!idBarberia) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="v2-card-small">
          <p className="text-center text-[var(--text-muted)]">Cargando...</p>
        </div>
        <div className="v2-card-small">
          <p className="text-center text-[var(--text-muted)]">Cargando...</p>
        </div>
        <div className="v2-card-small">
          <p className="text-center text-[var(--text-muted)]">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar skeleton mientras cargan los datos
  if (loadingEstadisticas) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="v2-card-small">
          <div className="v2-skeleton h-6 w-24 mb-2"></div>
          <div className="v2-skeleton h-8 w-32"></div>
        </div>
        <div className="v2-card-small">
          <div className="v2-skeleton h-6 w-24 mb-2"></div>
          <div className="v2-skeleton h-8 w-32"></div>
        </div>
        <div className="v2-card-small">
          <div className="v2-skeleton h-6 w-24 mb-2"></div>
          <div className="v2-skeleton h-8 w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <TarjetaResumen
        titulo="Total Ingresos"
        monto={estadisticas?.totalIngresos || 0}
        porcentajeCambio={estadisticas?.porcentajeCambio}
        icono="💰"
        tipo="ingreso"
      />
      <TarjetaResumen
        titulo="Total Gastos"
        monto={estadisticas?.totalGastos || 0}
        icono="💸"
        tipo="gasto"
      />
      <TarjetaResumen
        titulo="Balance"
        monto={estadisticas?.balance || 0}
        icono="📊"
        tipo="balance"
      />
    </div>
  );
}