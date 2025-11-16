"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeableTabsProps {
  tabs: Array<{
    href: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  children: React.ReactNode;
  threshold?: number;
}

export function SwipeableTabs({ tabs, children, threshold = 50 }: SwipeableTabsProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles
    if (!isMobile) return;
    
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsSwiping(true);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles
    if (!isMobile || !isSwiping) return;
    
    const currentPosX = e.touches[0].clientX;
    setCurrentX(currentPosX);
    
    const diff = currentPosX - startX;
    if (Math.abs(diff) > 10) { // Umbral mínimo para detectar swipe
      setSwipeDirection(diff > 0 ? 'right' : 'left');
    }
  };

  const handleTouchEnd = () => {
    // Solo activar en dispositivos móviles
    if (!isMobile || !isSwiping) return;
    
    const diff = currentX - startX;
    const swipeThreshold = threshold; // Umbral para considerar un swipe válido
    
    if (Math.abs(diff) > swipeThreshold) {
      // Determinar el índice actual
      const currentIndex = tabs.findIndex(tab => pathname?.startsWith(tab.href));
      
      if (currentIndex !== -1) {
        let newIndex = currentIndex;
        
        if (diff > 0 && currentIndex > 0) {
          // Swipe hacia la derecha - ir al tab anterior
          newIndex = currentIndex - 1;
        } else if (diff < 0 && currentIndex < tabs.length - 1) {
          // Swipe hacia la izquierda - ir al siguiente tab
          newIndex = currentIndex + 1;
        }
        
        if (newIndex !== currentIndex) {
          router.push(tabs[newIndex].href);
        }
      }
    }
    
    setIsSwiping(false);
    setSwipeDirection(null);
  };

  // Efecto para resetear el estado cuando cambia la ruta
  useEffect(() => {
    setIsSwiping(false);
    setSwipeDirection(null);
  }, [pathname]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full"
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