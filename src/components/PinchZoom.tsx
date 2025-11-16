"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface PinchZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  onZoom?: (scale: number) => void;
}

export function PinchZoom({ 
  children, 
  minScale = 1, 
  maxScale = 3,
  onZoom
}: PinchZoomProps) {
  const [scale, setScale] = useState(1);
  const [startScale, setStartScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles
    if (!isMobile || e.touches.length !== 2) return;
    
    // Calcular la distancia inicial entre los dos dedos
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const initialDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    setStartScale(scale);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles con dos dedos
    if (!isMobile || e.touches.length !== 2) return;
    
    e.preventDefault();
    
    // Calcular la distancia actual entre los dos dedos
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    // Calcular la escala basada en la distancia
    const newScale = Math.min(maxScale, Math.max(minScale, startScale * (currentDistance / 100)));
    
    setScale(newScale);
    
    // Llamar al callback si existe
    if (onZoom) {
      onZoom(newScale);
    }
  };

  const handleTouchEnd = () => {
    // Resetear cuando se levantan los dedos
    if (!isMobile) return;
  };

  // Resetear el zoom cuando cambia el children
  useEffect(() => {
    setScale(1);
    if (onZoom) {
      onZoom(1);
    }
  }, [children, onZoom]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        transition: scale === 1 ? 'transform 0.3s ease' : 'none'
      }}
    >
      {children}
    </div>
  );
}