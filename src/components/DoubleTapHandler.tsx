"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface DoubleTapHandlerProps {
  children: React.ReactNode;
  onDoubleTap: () => void;
  doubleTapDelay?: number;
  disabled?: boolean;
}

export function DoubleTapHandler({ 
  children, 
  onDoubleTap, 
  doubleTapDelay = 300,
  disabled = false
}: DoubleTapHandlerProps) {
  const [lastTap, setLastTap] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled) return;
    
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    if (timeDiff < doubleTapDelay && timeDiff > 0) {
      // Doble toque detectado
      setTapCount(2);
      onDoubleTap();
    } else {
      // Primer toque
      setTapCount(1);
    }
    
    setLastTap(now);
    
    // Resetear el contador después del tiempo de espera
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, doubleTapDelay);
  };

  // Limpiar el timeout cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  // Resetear estados cuando se deshabilita
  useEffect(() => {
    if (disabled) {
      setTapCount(0);
      setLastTap(0);
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
    }
  }, [disabled]);

  return (
    <div 
      className="w-full h-full"
      onTouchStart={handleTouchStart}
    >
      {children}
      
      {/* Indicador visual de doble toque */}
      {tapCount === 2 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-ping absolute w-16 h-16 rounded-full bg-orange-500 opacity-75"></div>
          <div className="relative w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}