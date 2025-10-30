"use client";

import { KPICard } from './KPICard';

interface OccupancyWidgetProps {
  value: number;
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export function OccupancyWidget({ value, description, trend, trendValue }: OccupancyWidgetProps) {
  return (
    <KPICard
      title="Tasa de Ocupación"
      value={`${value}%`}
      description={description || "Turnos ocupados"}
      trend={trend}
      trendValue={trendValue}
    />
  );
}