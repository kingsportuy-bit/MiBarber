import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Componente Avatar para mostrar fotos de perfil
 * @param src - URL de la imagen (opcional)
 * @param alt - Texto alternativo para la imagen
 * @param size - Tamaño del avatar (default: 'md')
 */
export function Avatar({
  src,
  alt,
  size = 'md',
  className = ''
}: AvatarProps) {
  // Tamaños predefinidos
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Generar inicial del nombre para avatar por defecto
  const initial = alt.charAt(0).toUpperCase();

  // Si hay una imagen, mostrarla
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover border-2 border-[var(--color-primary)] ${className}`.trim()}
      />
    );
  }

  // Si no hay imagen, mostrar un avatar con la inicial
  return (
    <div
      className={`${sizeClass} rounded-full bg-[var(--color-primary)] flex items-center justify-center font-bold text-white ${className}`.trim()}
    >
      {initial}
    </div>
  );
}