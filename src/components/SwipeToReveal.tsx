"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeToRevealProps {
  children: React.ReactNode;
  revealContent: React.ReactNode;
  threshold?: number;
  direction?: 'left' | 'right';
  disabled?: boolean;
}

export function SwipeToReveal({ 
  children, 
  revealContent,
  threshold = 50,
  direction = 'left',
  disabled = false
}: SwipeToRevealProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
    
    // Verificar la dirección permitida
    const isValidDirection = 
      (direction === 'left' && distance < 0) ||
      (direction === 'right' && distance > 0);
    
    if (isValidDirection) {
      e.preventDefault();
      setSwipeDistance(Math.abs(distance));
    }
  };

  const handleTouchEnd = () => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const distance = currentX - startX;
    const isValidDirection = 
      (direction === 'left' && distance < 0) ||
      (direction === 'right' && distance > 0);
    
    if (Math.abs(distance) > threshold && isValidDirection) {
      // Revelar el contenido
      setIsRevealed(true);
    } else {
      // Resetear estados
      setIsRevealed(false);
    }
    
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  const handleClose = () => {
    setIsRevealed(false);
  };

  // Resetear estados cuando se deshabilita
  useEffect(() => {
    if (disabled) {
      setIsSwiping(false);
      setSwipeDistance(0);
      setIsRevealed(false);
    }
  }, [disabled]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Contenido principal */}
      <div 
        ref={contentRef}
        className="w-full h-full relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isSwiping ? `translateX(${currentX - startX}px)` : 'translateX(0)',
          transition: isSwiping ? 'none' : 'transform 0.3s ease',
        }}
      >
        {children}
      </div>
      
      {/* Contenido revelado */}
      <div 
        className={`absolute top-0 h-full w-full bg-gray-900 z-10 transition-transform duration-300 ease-out ${
          direction === 'left' ? 'left-0' : 'right-0'
        }`}
        style={{
          transform: isRevealed ? 
            (direction === 'left' ? 'translateX(0)' : 'translateX(0)') : 
            (direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)')
        }}
      >
        <div className="w-full h-full relative">
          {/* Botón para cerrar */}
          <button 
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-800 text-white"
            onClick={handleClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {revealContent}
        </div>
      </div>
    </div>
  );
}