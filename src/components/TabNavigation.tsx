"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  className?: string;
}

export function TabNavigation({ tabs, className = '' }: TabNavigationProps) {
  const pathname = usePathname();
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSwiping(true);
    setSwipeStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    // Prevent horizontal scrolling while swiping
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    const swipeEndX = e.changedTouches[0].clientX;
    const deltaX = swipeEndX - swipeStartX;
    
    // Only consider significant swipes
    if (Math.abs(deltaX) > 50) {
      const currentIndex = tabs.findIndex(tab => tab.href === pathname);
      
      if (currentIndex !== -1) {
        let newIndex;
        
        if (deltaX > 0) {
          // Swipe right - go to previous tab
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          // Swipe left - go to next tab
          newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        // Navigate to new tab
        const newTab = tabs[newIndex];
        window.location.href = newTab.href;
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex overflow-x-auto pb-1 -mb-1 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex items-center justify-center py-2 px-3 text-xs font-medium rounded-t-lg mr-1 relative transition-all duration-200 truncate ${
              isActive 
                ? "text-blue-600 bg-white border-x border-t border-gray-200 z-10"
                : "text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 border border-transparent"
            }`}
            style={{
              clipPath: isActive 
                ? "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)" 
                : "polygon(0 0, calc(100% - 8px) 0, calc(100% - 2px) 100%, 0 100%)"
            }}
          >
            {tab.icon && <span className="mr-1">{tab.icon}</span>}
            <span className="truncate">{tab.label}</span>
          </Link>
        );
      })}
      <div className="flex-grow border-b border-gray-200"></div>
    </div>
  );
}
