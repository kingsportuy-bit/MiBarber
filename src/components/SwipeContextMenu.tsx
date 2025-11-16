"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface SwipeContextMenuProps {
  children: React.ReactNode;
  menuItems: Array<{
    label: string;
    icon?: React.ReactNode;
    action: () => void;
  }>;
  threshold?: number;
  disabled?: boolean;
}

export function SwipeContextMenu({ 
  children, 
  menuItems,
  threshold = 50,
  disabled = false
}: SwipeContextMenuProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled) return;
    
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsSwiping(true);
    setSwipeDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const currentPosX = e.touches[0].clientX;
    setCurrentX(currentPosX);
    
    const distance = currentPosX - startX;
    
    // Solo permitir deslizamiento hacia la izquierda
    if (distance < 0) {
      e.preventDefault();
      setSwipeDistance(Math.abs(distance));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Solo activar en dispositivos móviles y si no está deshabilitado
    if (!isMobile || disabled || !isSwiping) return;
    
    const distance = currentX - startX;
    
    if (Math.abs(distance) > threshold && distance < 0) {
      // Mostrar el menú contextual
      const touch = e.touches[0] || { clientX: window.innerWidth - 20, clientY: window.innerHeight / 2 };
      setMenuPosition({
        x: touch.clientX,
        y: touch.clientY
      });
      setShowMenu(true);
    }
    
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Cerrar el menú con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showMenu]);

  // Resetear estados cuando se deshabilita
  useEffect(() => {
    if (disabled) {
      setIsSwiping(false);
      setSwipeDistance(0);
      setShowMenu(false);
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
      {children}
      
      {/* Menú contextual */}
      {showMenu && (
        <div 
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2 animate-fadeIn"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            transform: 'translate(-100%, -50%)',
            minWidth: '150px'
          }}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="flex items-center w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors duration-200"
              onClick={() => handleMenuItemClick(item.action)}
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Overlay para cerrar el menú */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}