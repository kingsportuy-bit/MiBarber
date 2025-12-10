import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

/**
 * Badge base del sistema V2
 * @param variant - Estilo visual (default: 'secondary')
 */
export function Badge({
  variant = 'secondary',
  children,
  className = '',
}: BadgeProps) {
  const classes = `v2-badge v2-badge-${variant} ${className}`.trim();
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
}