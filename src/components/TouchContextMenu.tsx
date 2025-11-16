"use client";

import React, { useState, useRef, useEffect } from 'react';

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface TouchContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  className?: string;
}

export function TouchContextMenu({
  children,
  items,
  className = ''
}: TouchContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLongPress, setIsLongPress] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Clear any existing timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Set new long press timer
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      const touch = e.touches[0];
      setPosition({ x: touch.clientX, y: touch.clientY });
      setIsOpen(true);
    }, 500); // 500ms for long press
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = () => {
    // Cancel long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Reset long press flag
    setIsLongPress(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      
      // Clean up timer on unmount
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [isOpen]);

  // Adjust menu position to stay within viewport
  const getMenuStyle = () => {
    // Default position
    let x = position.x;
    let y = position.y;
    
    // Menu dimensions (approximate)
    const menuWidth = 200;
    const menuHeight = items.length * 40 + 20; // Approximate height
    
    // Adjust if menu goes off screen
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    
    // Ensure menu doesn't go off left/top of screen
    x = Math.max(10, x);
    y = Math.max(10, y);
    
    return {
      left: `${x}px`,
      top: `${y}px`
    };
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-50"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px]"
            style={{ 
              ...getMenuStyle(),
              pointerEvents: 'auto'
            }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                  item.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}