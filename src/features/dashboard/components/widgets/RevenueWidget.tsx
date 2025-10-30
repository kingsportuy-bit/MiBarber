"use client";

import { KPICard } from './KPICard';

interface RevenueWidgetProps {
  value: number;
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export function RevenueWidget({ value, description, trend, trendValue }: RevenueWidgetProps) {
  return (
    <KPICard
      title="Ingresos Totales"
      value={`$${value.toFixed(2)}`}
      description={description || "Ingresos del período"}
      trend={trend}
      trendValue={trendValue}
    />
  );
}