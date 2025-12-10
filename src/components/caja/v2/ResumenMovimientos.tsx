import React from 'react';
import { formatearMonto } from '@/types/caja';
import type { MovimientoCaja } from '@/types/caja';

interface ResumenMovimientosProps {
  movimientos: MovimientoCaja[];
  className?: string;
}

/**
 * Componente para mostrar el resumen de ingresos, gastos y balance en texto plano
 */
export function ResumenMovimientos({ movimientos, className = '' }: ResumenMovimientosProps) {
  // Calcular totales
  const totales = movimientos.reduce(
    (acc, movimiento) => {
      const monto = movimiento.monto || 0;
      if (movimiento.tipo === 'ingreso') {
        acc.ingresos += monto;
      } else {
        acc.gastos += monto;
      }
      return acc;
    },
    { ingresos: 0, gastos: 0 }
  );

  const balance = totales.ingresos - totales.gastos;

  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm mb-4 ${className}`}>
      <span className="font-semibold">
        INGRESOS: <span className="text-green-500">{formatearMonto(totales.ingresos)}</span>
      </span>
      <span className="font-semibold">
        GASTOS: <span className="text-red-500">{formatearMonto(totales.gastos)}</span>
      </span>
      <span className="font-semibold">
        BALANCE: <span className={balance >= 0 ? 'text-green-500' : 'text-red-500'}>
          {formatearMonto(balance)}
        </span>
      </span>
    </div>
  );
}
