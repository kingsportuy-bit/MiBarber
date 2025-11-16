"use client";

import { useState, useEffect } from "react";
import { isMobile } from "@/utils/deviceDetection";

interface OrientationHandlerProps {
  children: React.ReactNode;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
}

export function OrientationHandler({ 
  children, 
  onOrientationChange 
}: OrientationHandlerProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isMobileDevice] = useState(isMobile());

  useEffect(() => {
    // Verificar la orientación inicial
    const checkOrientation = () => {
      if (typeof window === 'undefined') return;
      
      const isPortrait = window.innerHeight > window.innerWidth;
      const newOrientation = isPortrait ? 'portrait' : 'landscape';
      
      setOrientation(newOrientation);
      
      // Llamar al callback si existe
      if (onOrientationChange) {
        onOrientationChange(newOrientation);
      }
    };

    // Verificar la orientación al cargar
    checkOrientation();

    // Escuchar cambios en la orientación
    const handleOrientationChange = () => {
      checkOrientation();
    };

    // Agregar event listeners
    window.addEventListener('resize', handleOrientationChange);
    
    // Limpiar event listeners
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [onOrientationChange]);

  // No renderizar nada especial si no es un dispositivo móvil
  if (!isMobileDevice) {
    return <>{children}</>;
  }

  return (
    <div 
      className={`w-full h-full transition-all duration-300 ${
        orientation === 'portrait' ? 'orientation-portrait' : 'orientation-landscape'
      }`}
    >
      {children}
    </div>
  );
}