"use client";

import { KPICard } from './KPICard';

interface CancellationWidgetProps {
  value: number;
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export function CancellationWidget({ value, description, trend, trendValue }: CancellationWidgetProps) {
  return (
    <KPICard
      title="Tasa de Cancelación"
      value={`${value}%`}
      description={description || "Turnos cancelados"}
      trend={trend}
      trendValue={trendValue}
    />
  );
}