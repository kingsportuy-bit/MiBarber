"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeTooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  threshold?: number;
  disabled?: boolean;
}

export function SwipeTooltip({ 
  children, 
  content,
  position = 'top',
  threshold = 50,
  disabled = false
}: SwipeTooltipProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled) return;
    
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsSwiping(true);
    setSwipeDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const currentPosX = e.touches[0].clientX;
    setCurrentX(currentPosX);
    
    const distance = currentPosX - startX;
    
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

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const distance = currentX - startX;
    const isValidDirection = 
      (position === 'left' && distance < 0) ||
      (position === 'right' && distance > 0) ||
      (position === 'top' && distance < 0) ||
      (position === 'bottom' && distance > 0);
    
    if (Math.abs(distance) > threshold && isValidDirection) {
      // Mostrar el tooltip
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom;
            break;
          case 'left':
            x = rect.left;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right;
            y = rect.top + rect.height / 2;
            break;
        }
        
        setTooltipPosition({ x, y });
        setShowTooltip(true);
        
        // Ocultar el tooltip después de 3 segundos
        setTimeout(() => {
          setShowTooltip(false);
        }, 3000);
      }
    }
    
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  // Cerrar el tooltip cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  // Cerrar el tooltip con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showTooltip]);

  // Resetear estados cuando se deshabilita
  useEffect(() => {
    if (disabled) {
      setIsSwiping(false);
      setSwipeDistance(0);
      setShowTooltip(false);
    }
  }, [disabled]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full inline-block"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      
      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg animate-fadeIn"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 
              position === 'top' ? 'translate(-50%, -100%)' :
              position === 'bottom' ? 'translate(-50%, 0)' :
              position === 'left' ? 'translate(-100%, -50%)' :
              'translate(0, -50%)',
            minWidth: '120px',
            maxWidth: '200px'
          }}
        >
          {content}
          <div 
            className="absolute w-3 h-3 bg-gray-900 rotate-45"
            style={{
              left: 
                position === 'top' || position === 'bottom' ? '50%' :
                position === 'left' ? '-6px' : 'auto',
              right: position === 'right' ? '-6px' : 'auto',
              top: 
                position === 'left' || position === 'right' ? '50%' :
                position === 'top' ? '-6px' : 'auto',
              bottom: position === 'bottom' ? '-6px' : 'auto',
              transform: 
                position === 'top' || position === 'bottom' ? 'translate(-50%, 0)' :
                'translate(0, -50%)'
            }}
          />
        </div>
      )}
    </div>
  );
}