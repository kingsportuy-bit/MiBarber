"use client";

import { KPICard } from './KPICard';

interface ClientsWidgetProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export function ClientsWidget({ title, value, description, trend, trendValue }: ClientsWidgetProps) {
  return (
    <KPICard
      title={title}
      value={value}
      description={description}
      trend={trend}
      trendValue={trendValue}
    />
  );
}