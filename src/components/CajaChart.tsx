"use client";

import { useMemo } from "react";
import type { CajaRecord } from "@/types/db";
import { formatCurrency } from "@/utils/formatters";

interface CajaChartProps {
  records: CajaRecord[];
}

export function CajaChart({ records }: CajaChartProps) {
  // Agrupar registros por fecha para el gráfico
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    // Agrupar por fecha
    const grouped: Record<string, number> = {};
    
    records.forEach(record => {
      const date = new Date(record.fecha).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = 0;
      }
      grouped[date] += record.monto;
    });

    // Convertir a array y ordenar por fecha
    return Object.entries(grouped)
      .map(([date, amount]) => ({
        date,
        amount
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Últimos 30 días
  }, [records]);

  if (chartData.length === 0) {
    return (
      <div className="qoder-dark-card p-6 text-center">
        <p className="text-qoder-dark-text-secondary">No hay datos para mostrar</p>
      </div>
    );
  }

  // Encontrar el valor máximo para escalar las barras
  const maxAmount = Math.max(...chartData.map(d => d.amount));

  return (
    <div className="qoder-dark-card p-6">
      <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Ingresos últimos 30 días</h3>
      <div className="flex items-end h-40 gap-1">
        {chartData.map((data, index) => {
          const height = maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-qoder-dark-accent-primary rounded-t transition-all hover:opacity-75"
                style={{ height: `${height}%` }}
                title={`${data.date}: ${formatCurrency(data.amount)}`}
              />
              <div className="text-xs text-qoder-dark-text-secondary mt-1 truncate w-full text-center">
                {new Date(data.date).getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-sm text-qoder-dark-text-secondary">
        <div className="flex justify-between">
          <span>Menor ingreso: {formatCurrency(Math.min(...chartData.map(d => d.amount)))}</span>
          <span>Promedio: {formatCurrency(chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.length)}</span>
          <span>Mayor ingreso: {formatCurrency(Math.max(...chartData.map(d => d.amount)))}</span>
        </div>
      </div>
    </div>
  );
}