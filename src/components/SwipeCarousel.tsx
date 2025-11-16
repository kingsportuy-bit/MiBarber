"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeCarouselProps {
  children: React.ReactNode[];
  autoplay?: boolean;
  autoplayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  infinite?: boolean;
  onSlideChange?: (currentIndex: number) => void;
}

export function SwipeCarousel({ 
  children, 
  autoplay = false,
  autoplayInterval = 3000,
  showIndicators = true,
  showArrows = true,
  infinite = true,
  onSlideChange
}: SwipeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Manejar autoplay
  useEffect(() => {
    if (autoplay && children.length > 1) {
      autoplayRef.current = setInterval(() => {
        goToNext();
      }, autoplayInterval);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, autoplayInterval, children.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles
    if (!isMobile) return;
    
    // Pausar autoplay mientras se interactúa
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsSwiping(true);
    setSwipeDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles
    if (!isMobile || !isSwiping) return;
    
    const currentPosX = e.touches[0].clientX;
    setCurrentX(currentPosX);
    
    const distance = currentPosX - startX;
    setSwipeDistance(distance);
  };

  const handleTouchEnd = () => {
    // Solo activar en dispositivos móviles
    if (!isMobile || !isSwiping) return;
    
    const distance = swipeDistance;
    const threshold = 50; // Umbral para considerar un swipe válido
    
    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        // Swipe hacia la derecha - ir al slide anterior
        goToPrev();
      } else {
        // Swipe hacia la izquierda - ir al siguiente slide
        goToNext();
      }
    }
    
    // Reiniciar autoplay si estaba activo
    if (autoplay && children.length > 1) {
      autoplayRef.current = setInterval(() => {
        goToNext();
      }, autoplayInterval);
    }
    
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => {
      if (infinite) {
        return (prevIndex + 1) % children.length;
      } else {
        return Math.min(prevIndex + 1, children.length - 1);
      }
    });
  };

  const goToPrev = () => {
    setCurrentIndex(prevIndex => {
      if (infinite) {
        return (prevIndex - 1 + children.length) % children.length;
      } else {
        return Math.max(prevIndex - 1, 0);
      }
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Llamar al callback cuando cambia el slide
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentIndex);
    }
  }, [currentIndex, onSlideChange]);

  if (children.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Contenedor de slides */}
      <div 
        className="flex w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${swipeDistance}px))`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease',
        }}
      >
        {children.map((child, index) => (
          <div 
            key={index} 
            className="w-full h-full flex-shrink-0"
          >
            {child}
          </div>
        ))}
      </div>
      
      {/* Flechas de navegación */}
      {showArrows && children.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all duration-200"
            onClick={goToPrev}
            aria-label="Slide anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all duration-200"
            onClick={goToNext}
            aria-label="Slide siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Indicadores */}
      {showIndicators && children.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-orange-500 scale-125' 
                  : 'bg-gray-500 hover:bg-gray-400'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}