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
    <div className="stat-card">
      {icon ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon}
          <div>
            <div className="stat-description">{title}</div>
            <div className="stat-number">{value}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="stat-description">{title}</div>
          <div className="stat-number">{value}</div>
        </>
      )}
      
      {description && (
        <div className="dashboard-subtitle">{description}</div>
      )}
      
      {trend && trendValue && (
        <div style={{ 
          color: trend === 'up' ? 'var(--qoder-accent-success)' : 'var(--qoder-accent-danger)',
          fontWeight: '500',
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          {trend === 'up' ? '↗' : '↘'} {trendValue}
        </div>
      )}
    </div>
  );
}