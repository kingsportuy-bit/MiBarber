"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipePanelProps {
  children: React.ReactNode;
  panelContent: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  width?: string;
  threshold?: number;
  disabled?: boolean;
}

export function SwipePanel({ 
  children, 
  panelContent,
  isOpen,
  onClose,
  position = 'left',
  width = '80%',
  threshold = 50,
  disabled = false
}: SwipePanelProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled) return;
    
    // Solo activar si el panel está abierto
    if (!isOpen) return;
    
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
      (position === 'left' && distance > 0) ||
      (position === 'right' && distance < 0);
    
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
      (position === 'left' && distance > 0) ||
      (position === 'right' && distance < 0);
    
    if (Math.abs(distance) > threshold && isValidDirection) {
      // Cerrar el panel
      onClose();
    }
    
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
    <div className="relative w-full h-full">
      {/* Contenido principal */}
      <div className="w-full h-full">
        {children}
      </div>
      
      {/* Panel lateral */}
      <div 
        ref={panelRef}
        className={`fixed top-0 h-full bg-gray-900 z-50 shadow-2xl transition-transform duration-300 ease-out ${
          position === 'left' ? 'left-0' : 'right-0'
        }`}
        style={{
          width: width,
          transform: isOpen ? 
            'translateX(0)' : 
            (position === 'left' ? 'translateX(-100%)' : 'translateX(100%)')
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchEnd}
        onTouchEnd={handleTouchEnd}
      >
        {/* Área de deslizamiento para cerrar */}
        <div 
          className="absolute top-0 h-full w-8 z-10"
          style={{
            [position === 'left' ? 'right' : 'left']: '-8px'
          } as React.CSSProperties}
        />
        
        {/* Contenido del panel */}
        <div className="w-full h-full relative">
          {/* Botón para cerrar */}
          <button 
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-800 text-white"
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Contenido del panel */}
          <div className="w-full h-full pt-12">
            {panelContent}
          </div>
        </div>
      </div>
      
      {/* Overlay para cerrar el panel */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
    </div>
  );
}