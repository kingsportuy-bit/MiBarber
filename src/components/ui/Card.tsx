import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente Card base del sistema V2
 */
export function Card({ children, className = '' }: CardProps) {
  // Si se pasa una clase v2 específica, usar esa. Si no, usar v2-card por defecto
  const baseClass = className.includes('v2-card') ? '' : 'v2-card';
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