import React from 'react';

interface TarjetaResumenProps {
  titulo: string;
  monto: number;
  porcentajeCambio?: number;
  icono: string;
  tipo: 'ingreso' | 'gasto' | 'balance';
}

export function TarjetaResumen({
  titulo,
  monto,
  porcentajeCambio,
  icono,
  tipo,
}: TarjetaResumenProps) {
  const colorClasses = {
    ingreso: 'text-green-500',
    gasto: 'text-red-500',
    balance: monto >= 0 ? 'text-green-500' : 'text-red-500',
  };

  const colorTexto = colorClasses[tipo];
  const porcentajePositivo = porcentajeCambio && porcentajeCambio >= 0;
  const colorPorcentaje = porcentajePositivo ? 'text-green-500' : 'text-red-500';
  const iconoPorcentaje = porcentajePositivo ? '↑' : '↓';

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-sm text-[var(--text-muted)]">{titulo}</span>
        {icono && <span className="text-2xl">{icono}</span>}
      </div>
      
      <div className={`text-3xl font-bold ${colorTexto} mb-1`}>
        ${monto.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {porcentajeCambio !== undefined && (
        <div className={`text-sm ${colorPorcentaje} flex items-center gap-1`}>
          <span>{iconoPorcentaje}</span>
          <span>{Math.abs(porcentajeCambio).toFixed(1)}%</span>
          <span className="text-[var(--text-muted)]">vs período anterior</span>
        </div>
      )}
    </div>
  );
}