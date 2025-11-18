"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface PullToRefreshProps {
  onRefresh: () => void;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 60,
  disabled = false
}: PullToRefreshProps) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const touchStartRef = useRef<{ startY: number; scrollTop: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Configurar los eventos táctiles con passive: false para permitir preventDefault
    const handleTouchStart = (e: TouchEvent) => {
      // Solo activar en dispositivos móviles y si no está deshabilitado
      if (!isMobile || disabled) return;
      
      // Registrar la posición inicial del scroll y del toque
      touchStartRef.current = {
        startY: e.touches[0].clientY,
        scrollTop: container.scrollTop
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Solo activar en dispositivos móviles y si no está deshabilitado
      if (!isMobile || disabled || !touchStartRef.current) return;
      
      const { startY, scrollTop } = touchStartRef.current;
      const currentPosY = e.touches[0].clientY;
      const distance = currentPosY - startY;
      
      // Solo activar pull-to-refresh si estamos al inicio de la página
      if (scrollTop === 0 && distance > 0) {
        // Prevenir el desplazamiento predeterminado solo cuando estamos tirando hacia abajo
        e.preventDefault();
        setCurrentY(currentPosY);
        setPullDistance(Math.min(distance, 100)); // Limitar a 100px
        setIsPulling(true);
      }
    };

    const handleTouchEnd = () => {
      // Solo activar en dispositivos móviles y si no está deshabilitado
      if (!isMobile || disabled || !touchStartRef.current) return;
      
      if (pullDistance > threshold) { // Umbral para activar el refresh
        setIsRefreshing(true);
        onRefresh();
        
        // Resetear después de 1 segundo
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 1000);
      } else {
        setPullDistance(0);
      }
      
      setIsPulling(false);
      touchStartRef.current = null;
    };

    // Añadir los event listeners con passive: false para handleTouchMove
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Limpiar los event listeners al desmontar
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, disabled, pullDistance, threshold, onRefresh]);

  // Resetear estados cuando se deshabilita
  useEffect(() => {
    if (disabled) {
      setIsPulling(false);
      setIsRefreshing(false);
      setPullDistance(0);
      touchStartRef.current = null;
    }
  }, [disabled]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full"
    >
      {/* Indicador de pull-to-refresh */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center py-2 transition-all duration-200 z-50"
          style={{ 
            transform: `translateY(${pullDistance - 40}px)`,
            opacity: Math.min(pullDistance / 100, 1)
          }}
        >
          <div className="flex flex-col items-center">
            {isRefreshing ? (
              <div className="loading-spinner w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`w-6 h-6 text-orange-500 transition-transform duration-200 ${
                  pullDistance > threshold ? 'rotate-180' : ''
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span className="text-xs text-gray-400 mt-1">
              {isRefreshing ? 'Actualizando...' : pullDistance > threshold ? 'Soltar para actualizar' : 'Deslizar hacia abajo'}
            </span>
          </div>
        </div>
      )}
      
      <div 
        className="w-full h-full"
        style={{
          transform: isPulling ? `translateY(${Math.min(pullDistance, 100)}px)` : 'translateY(0)',
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
}