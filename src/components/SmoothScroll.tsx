"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface SmoothScrollProps {
  children: React.ReactNode;
  behavior?: "auto" | "smooth";
}

export function SmoothScroll({ children, behavior = "smooth" }: SmoothScrollProps) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Efecto para manejar el scroll suave cuando cambia la ruta
  useEffect(() => {
    if (scrollRef.current) {
      // Scroll to top when pathname changes
      scrollRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior
      });
    }
  }, [pathname, behavior]);

  // Función para scroll suave a un elemento específico
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element && scrollRef.current) {
      const offsetTop = element.offsetTop;
      scrollRef.current.scrollTo({
        top: offsetTop,
        behavior: behavior
      });
    }
  };

  // Función para scroll suave a una posición específica
  const scrollToPosition = (position: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: position,
        behavior: behavior
      });
    }
  };

  return (
    <div 
      ref={scrollRef}
      className="w-full h-full overflow-auto scroll-smooth"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {children}
    </div>
  );
}