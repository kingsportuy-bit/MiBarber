"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeDownToCloseProps {
  children: React.ReactNode;
  onClose: () => void;
  threshold?: number;
  disabled?: boolean;
}

export function SwipeDownToClose({ 
  children, 
  onClose, 
  threshold = 100,
  disabled = false
}: SwipeDownToCloseProps) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled) return;
    
    // Solo activar si estamos en la parte superior del contenido
    if (containerRef.current && containerRef.current.scrollTop > 0) return;
    
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsSwiping(true);
    setSwipeDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const currentPosY = e.touches[0].clientY;
    setCurrentY(currentPosY);
    
    const distance = currentPosY - startY;
    
    // Solo permitir deslizamiento hacia abajo
    if (distance > 0) {
      e.preventDefault();
      setSwipeDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    if (swipeDistance > threshold) {
      // Cerrar el componente
      onClose();
    }
    
    // Resetear estados
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  // Resetear estados cuando se deshabilita
  useEffect(() => {
    if (disabled) {
      setIsSwiping(false);
      setSwipeDistance(0);
    }
  }, [disabled]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isSwiping ? `translateY(${swipeDistance}px)` : 'translateY(0)',
        transition: isSwiping ? 'none' : 'transform 0.3s ease',
      }}
    >
      {/* Indicador visual de deslizamiento */}
      {isSwiping && swipeDistance > 10 && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-10 h-1 bg-gray-600 rounded-full opacity-70"></div>
        </div>
      )}
      
      {children}
    </div>
  );
}