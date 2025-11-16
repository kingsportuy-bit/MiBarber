"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeToCloseProps {
  children: React.ReactNode;
  onClose: () => void;
  threshold?: number;
  direction?: 'left' | 'right' | 'both';
  disabled?: boolean;
}

export function SwipeToClose({ 
  children, 
  onClose, 
  threshold = 100,
  direction = 'both',
  disabled = false
}: SwipeToCloseProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled) return;
    
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsSwiping(true);
    setSwipeDistance(0);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const currentPosX = e.touches[0].clientX;
    setCurrentX(currentPosX);
    
    const distance = currentPosX - startX;
    
    // Verificar la dirección permitida
    const isValidDirection = 
      (direction === 'both') ||
      (direction === 'left' && distance < 0) ||
      (direction === 'right' && distance > 0);
    
    if (isValidDirection) {
      e.preventDefault();
      setSwipeDistance(Math.abs(distance));
      setSwipeDirection(distance > 0 ? 'right' : 'left');
    }
  };

  const handleTouchEnd = () => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const distance = currentX - startX;
    const isValidDirection = 
      (direction === 'both') ||
      (direction === 'left' && distance < 0) ||
      (direction === 'right' && distance > 0);
    
    if (Math.abs(distance) > threshold && isValidDirection) {
      // Cerrar el componente
      onClose();
    }
    
    // Resetear estados
    setIsSwiping(false);
    setSwipeDistance(0);
    setSwipeDirection(null);
  };

  // Resetear estados cuando se deshabilita
  useEffect(() => {
    if (disabled) {
      setIsSwiping(false);
      setSwipeDistance(0);
      setSwipeDirection(null);
    }
  }, [disabled]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isSwiping ? `translateX(${currentX - startX}px)` : 'translateX(0)',
        transition: isSwiping ? 'none' : 'transform 0.3s ease',
        opacity: isSwiping ? 0.9 : 1
      }}
    >
      {/* Indicador visual de deslizamiento */}
      {isSwiping && swipeDistance > 10 && (
        <div className="absolute top-1/2 transform -translate-y-1/2 z-10">
          {swipeDirection === 'left' && (
            <div className="absolute left-4 text-orange-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          )}
          {swipeDirection === 'right' && (
            <div className="absolute right-4 text-orange-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
}