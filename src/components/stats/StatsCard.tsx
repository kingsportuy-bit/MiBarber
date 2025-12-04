import { ReactNode } from 'react';

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  className?: string;
}

export function StatsCard({ 
  label, 
  value, 
  icon, 
  trend, 
  trendValue,
  description,
  className = ''
}: StatsCardProps) {
  return (
    <div className={`bg-black/60 rounded-xl border border-qoder-dark-border p-6 ${className}`}>
      {icon && (
        <div className="mb-2 text-qoder-dark-accent-orange">
          {icon}
        </div>
      )}
      <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
        {label}
      </h3>
      <p className="text-4xl font-bold text-white mb-1">
        {value}
      </p>
      {description && (
        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      )}
      {trend && trendValue && (
        <div className={`text-sm font-semibold mt-2 flex items-center gap-1 ${
          trend === 'up' ? 'text-green-500' : 
          trend === 'down' ? 'text-red-500' : 
          'text-gray-400'
        }`}>
          <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}