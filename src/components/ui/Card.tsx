import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente Card base del sistema V2
 */
export function Card({ children, className = '' }: CardProps) {
  // Use the global app-card class by default
  const baseClass = (className.includes('app-card') || className.includes('v2-card')) ? '' : 'app-card';
  const classes = `${baseClass} ${className}`.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  const classes = `v2-mb-md ${className}`.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  const classes = className.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
}