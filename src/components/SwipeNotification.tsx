"use client";

import React, { useState, useRef, useEffect } from 'react';

interface SwipeNotificationProps {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onDismiss?: (id: string) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

export function SwipeNotification({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  onDismiss,
  onTouchStart,
  onTouchEnd
}: SwipeNotificationProps) {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  // Handle auto-dismiss
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSwiping(true);
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    onTouchStart?.();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    
    // Only allow horizontal swiping
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
      setSwipeOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    const endTime = Date.now();
    const swipeTime = endTime - startTime.current;
    const velocity = Math.abs(swipeOffset) / swipeTime;
    
    // Dismiss if swiped far enough or fast enough
    if (Math.abs(swipeOffset) > 100 || velocity > 0.5) {
      handleDismiss();
    } else {
      // Reset position if not dismissed
      setSwipeOffset(0);
    }
    
    onTouchEnd?.();
  };

  const handleDismiss = () => {
    if (notificationRef.current) {
      notificationRef.current.style.transform = `translateX(${swipeOffset > 0 ? '100%' : '-100%'})`;
      notificationRef.current.style.opacity = '0';
      
      setTimeout(() => {
        onDismiss?.(id);
      }, 300);
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  return (
    <div
      ref={notificationRef}
      className={`relative flex items-start p-4 mb-2 rounded-lg shadow-lg border-l-4 text-white transform transition-all duration-300 ${getTypeStyles()} ${
        isSwiping ? 'transition-none' : ''
      }`}
      style={{
        transform: `translateX(${swipeOffset}px)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1">
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Cerrar notificación"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}