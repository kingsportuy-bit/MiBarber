"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeNavigationProps {
  children: React.ReactNode;
  routes: string[];
  threshold?: number;
  disabled?: boolean;
}

export function SwipeNavigation({ 
  children, 
  routes, 
  threshold = 50,
  disabled = false
}: SwipeNavigationProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled) return;
    
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsSwiping(true);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const currentPosX = e.touches[0].clientX;
    setCurrentX(currentPosX);
    
    const diff = currentPosX - startX;
    if (Math.abs(diff) > 10) { // Umbral mínimo para detectar swipe
      setSwipeDirection(diff > 0 ? 'right' : 'left');
    }
  };

  const handleTouchEnd = () => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const diff = currentX - startX;
    const swipeThreshold = threshold; // Umbral para considerar un swipe válido
    
    if (Math.abs(diff) > swipeThreshold) {
      // Determinar el índice actual
      const currentIndex = routes.indexOf(pathname);
      
      if (currentIndex !== -1) {
        let newIndex = currentIndex;
        
        if (diff > 0 && currentIndex > 0) {
          // Swipe hacia la derecha - ir a la ruta anterior
          newIndex = currentIndex - 1;
        } else if (diff < 0 && currentIndex < routes.length - 1) {
          // Swipe hacia la izquierda - ir a la siguiente ruta
          newIndex = currentIndex + 1;
        }
        
        if (newIndex !== currentIndex) {
          router.push(routes[newIndex]);
        }
      }
    }
    
    setIsSwiping(false);
    setSwipeDirection(null);
  };

  // Resetear estados cuando se deshabilita
  useEffect(() => {
    if (disabled) {
      setIsSwiping(false);
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
    >
      <div 
        className="w-full h-full transition-transform duration-300 ease-out"
        style={{ 
          transform: isSwiping ? `translateX(${currentX - startX}px)` : 'translateX(0)',
          opacity: isSwiping ? 0.95 : 1
        }}
      >
        {children}
      </div>
      
      {/* Indicadores de swipe */}
      {isSwiping && swipeDirection && (
        <div className="absolute top-1/2 transform -translate-y-1/2 z-10">
          {swipeDirection === 'left' && (
            <div className="absolute left-4 text-orange-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
          {swipeDirection === 'right' && (
            <div className="absolute right-4 text-orange-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}