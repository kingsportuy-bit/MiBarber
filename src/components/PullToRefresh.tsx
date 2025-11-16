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

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled) return;
    
    // Solo activar si estamos en la parte superior del contenido
    if (containerRef.current && containerRef.current.scrollTop > 0) return;
    
    setStartY(e.touches[0].clientY);
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isPulling) return;
    
    const currentPosY = e.touches[0].clientY;
    const distance = currentPosY - startY;
    
    // Solo activar pull-to-refresh si estamos al inicio de la página
    if (window.scrollY === 0 && distance > 0) {
      e.preventDefault();
      setCurrentY(currentPosY);
      setPullDistance(Math.min(distance, 100)); // Limitar a 100px
    }
  };

  const handleTouchEnd = () => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isPulling) return;
    
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
  };

  // Resetear estados cuando se deshabilita
  useEffect(() => {
    if (disabled) {
      setIsPulling(false);
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [disabled]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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