"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: string;
  threshold?: number;
  disabled?: boolean;
}

export function SwipeDrawer({ 
  children, 
  isOpen,
  onClose,
  position = 'bottom',
  size = '80%',
  threshold = 50,
  disabled = false
}: SwipeDrawerProps) {
  const [startPos, setStartPos] = useState(0);
  const [currentPos, setCurrentPos] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled) return;
    
    // Solo activar si el drawer está abierto
    if (!isOpen) return;
    
    const touchPos = 
      position === 'left' || position === 'right' 
        ? e.touches[0].clientX 
        : e.touches[0].clientY;
    
    setStartPos(touchPos);
    setCurrentPos(touchPos);
    setIsSwiping(true);
    setSwipeDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const touchPos = 
      position === 'left' || position === 'right' 
        ? e.touches[0].clientX 
        : e.touches[0].clientY;
    
    setCurrentPos(touchPos);
    
    const distance = touchPos - startPos;
    
    // Verificar la dirección permitida según la posición
    const isValidDirection = 
      (position === 'left' && distance < 0) ||
      (position === 'right' && distance > 0) ||
      (position === 'top' && distance < 0) ||
      (position === 'bottom' && distance > 0);
    
    if (isValidDirection) {
      e.preventDefault();
      setSwipeDistance(Math.abs(distance));
    }
  };

  const handleTouchEnd = () => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const distance = currentPos - startPos;
    const isValidDirection = 
      (position === 'left' && distance < 0) ||
      (position === 'right' && distance > 0) ||
      (position === 'top' && distance < 0) ||
      (position === 'bottom' && distance > 0);
    
    if (Math.abs(distance) > threshold && isValidDirection) {
      // Cerrar el drawer
      onClose();
    }
    
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  // Cerrar el drawer con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Resetear estados cuando se deshabilita o cierra
  useEffect(() => {
    if (disabled || !isOpen) {
      setIsSwiping(false);
      setSwipeDistance(0);
    }
  }, [disabled, isOpen]);

  if (!isOpen) {
    return null;
  }

  // Calcular la transformación según la posición
  const getTransform = () => {
    if (isSwiping) {
      const distance = currentPos - startPos;
      switch (position) {
        case 'left':
          return `translateX(${Math.max(distance, -parseInt(size))}px)`;
        case 'right':
          return `translateX(${Math.min(distance, parseInt(size))}px)`;
        case 'top':
          return `translateY(${Math.max(distance, -parseInt(size))}px)`;
        case 'bottom':
          return `translateY(${Math.min(distance, parseInt(size))}px)`;
        default:
          return 'translate(0)';
      }
    }
    return 'translate(0)';
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        style={{
          opacity: isSwiping ? 0.5 : 1
        }}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`absolute bg-gray-900 shadow-2xl transition-transform duration-300 ease-out ${
          position === 'left' || position === 'right' 
            ? 'top-0 h-full' 
            : 'left-0 w-full'
        }`}
        style={{
          [position === 'left' ? 'left' : 
           position === 'right' ? 'right' : 
           position === 'top' ? 'top' : 'bottom']: 0,
          [position === 'left' || position === 'right' ? 'width' : 'height']: size,
          transform: getTransform(),
          ...(position === 'left' || position === 'right' 
            ? { maxWidth: '300px' } 
            : { maxHeight: '80vh' })
        } as React.CSSProperties}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Barra de deslizamiento (solo para top y bottom) */}
        {(position === 'top' || position === 'bottom') && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
          </div>
        )}
        
        {/* Área de deslizamiento para cerrar (solo para left y right) */}
        {(position === 'left' || position === 'right') && (
          <div 
            className="absolute top-0 h-full w-8 z-10"
            style={{
              [position === 'left' ? 'right' : 'left']: '-8px'
            } as React.CSSProperties}
          />
        )}
        
        {/* Contenido del drawer */}
        <div className="w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}