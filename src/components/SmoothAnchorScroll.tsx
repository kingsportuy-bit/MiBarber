"use client";

import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SmoothAnchorScrollProps {
  children: React.ReactNode;
  behavior?: "auto" | "smooth";
  block?: "start" | "center" | "end" | "nearest";
  inline?: "start" | "center" | "end" | "nearest";
}

export function SmoothAnchorScroll({ 
  children, 
  behavior = "smooth",
  block = "start",
  inline = "nearest"
}: SmoothAnchorScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Solo activar en dispositivos móviles
    if (!isMobile || !containerRef.current) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      
      if (anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href')?.substring(1);
        
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior,
              block,
              inline
            });
          }
        }
      }
    };

    // Agregar event listener al contenedor
    const container = containerRef.current;
    container.addEventListener('click', handleAnchorClick);

    return () => {
      container.removeEventListener('click', handleAnchorClick);
    };
  }, [behavior, block, inline, isMobile]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full"
    >
      {children}
    </div>
  );
}