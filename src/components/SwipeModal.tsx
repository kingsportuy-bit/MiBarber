"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  swipeToClose?: boolean;
  threshold?: number;
  disabled?: boolean;
}

export function SwipeModal({ 
  children, 
  isOpen,
  onClose,
  title,
  showCloseButton = true,
  swipeToClose = true,
  threshold = 100,
  disabled = false
}: SwipeModalProps) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !swipeToClose) return;
    
    // Solo activar si el modal está abierto
    if (!isOpen) return;
    
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsSwiping(true);
    setSwipeDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !swipeToClose || !isSwiping) return;
    
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
    if (!isMobile || disabled || !swipeToClose || !isSwiping) return;
    
    const distance = currentY - startY;
    
    if (distance > threshold) {
      // Cerrar el modal
      onClose();
    }
    
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  // Cerrar el modal con la tecla Escape
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-gray-900 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out"
        style={{
          transform: isSwiping ? `translateY(${swipeDistance}px)` : 'translateY(0)',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Barra de deslizamiento */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
        </div>
        
        {/* Cabecera del modal */}
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
            {title && (
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            )}
            {showCloseButton && (
              <button 
                className="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Contenido del modal */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
}