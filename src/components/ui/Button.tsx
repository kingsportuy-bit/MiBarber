import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/**
 * Botón base del sistema V2
 * @param variant - Estilo visual (default: 'secondary')
 * @param size - Tamaño del botón (default: 'md')
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClass = variant === 'primary' ? 'app-btn-primary' : `v2-btn v2-btn-${variant}`;
  const classes = `${baseClass} ${variant === 'primary' ? '' : `v2-btn-${size}`} ${className}`.trim();

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}