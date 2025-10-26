"use client";

import React, { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
};

export function StatCard({ title, value, description, icon, trend, trendValue }: StatCardProps) {
  return (
    <div className="qoder-dark-card">
      <div className="qoder-dark-window-header">
        <h3 className="font-semibold text-qoder-dark-text-primary flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold text-qoder-dark-text-primary">{value}</div>
        {description && (
          <div className="text-sm text-qoder-dark-text-secondary mt-1">{description}</div>
        )}
        {trend && trendValue && (
          <div className={`text-sm mt-2 flex items-center gap-1 ${
            trend === 'up' ? 'text-qoder-dark-accent-success' : 'text-qoder-dark-accent-danger'
          }`}>
            {trend === 'up' ? '↗' : '↘'} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}