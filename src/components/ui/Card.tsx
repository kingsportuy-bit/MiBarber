import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente Card base del sistema V2
 */
export function Card({ children, className = '' }: CardProps) {
  // Agregamos un borde gris de 1px a las tarjetas
  const classes = `v2-card border border-[var(--border-primary)] ${className}`.trim();
  
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