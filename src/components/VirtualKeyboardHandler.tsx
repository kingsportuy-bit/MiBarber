"use client";

import { useState, useEffect, useRef } from "react";

interface VirtualKeyboardHandlerProps {
  children: React.ReactNode;
  onKeyboardShow?: () => void;
  onKeyboardHide?: () => void;
}

export function VirtualKeyboardHandler({ 
  children, 
  onKeyboardShow, 
  onKeyboardHide 
}: VirtualKeyboardHandlerProps) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const initialViewportHeight = useRef(0);

  useEffect(() => {
    // Obtener la altura inicial del viewport
    if (typeof window !== 'undefined') {
      initialViewportHeight.current = window.innerHeight;
    }

    const handleResize = () => {
      if (typeof window === 'undefined') return;
      
      // Calcular la diferencia de altura
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight.current - currentHeight;
      
      // Si la diferencia es significativa, asumimos que el teclado está visible
      const keyboardThreshold = 150; // Altura mínima para considerar el teclado visible
      
      if (heightDifference > keyboardThreshold) {
        // Teclado visible
        if (!isKeyboardVisible) {
          setIsKeyboardVisible(true);
          setKeyboardHeight(heightDifference);
          if (onKeyboardShow) onKeyboardShow();
        }
      } else {
        // Teclado oculto
        if (isKeyboardVisible) {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
          if (onKeyboardHide) onKeyboardHide();
        }
      }
    };

    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener('resize', handleResize);
    
    // Verificar la altura inicial
    handleResize();
    
    // Limpiar event listeners
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isKeyboardVisible, onKeyboardShow, onKeyboardHide]);

  return (
    <div 
      className="w-full h-full relative"
      style={{ 
        paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : '0px',
        transition: 'padding-bottom 0.3s ease'
      }}
    >
      {children}
    </div>
  );
}