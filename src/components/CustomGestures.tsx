"use client";

import React, { useRef } from 'react';

interface CustomGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onTap?: () => void;
  className?: string;
}

export function CustomGestures({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  onLongPress,
  onTap,
  className = ''
}: CustomGesturesProps) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastTapTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();

    // Clear any existing timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Set new long press timer
    longPressTimer.current = setTimeout(() => {
      onLongPress?.();
    }, 500);
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Get ending coordinates
    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    
    // Cancel long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.current;
    
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / touchDuration;

    // Check for tap
    if (touchDuration < 200 && distance < 10) {
      const currentTime = Date.now();
      const tapInterval = currentTime - lastTapTime.current;

      // Check for double tap
      if (tapInterval > 0 && tapInterval < 300) {
        onDoubleTap?.();
        lastTapTime.current = 0; // Reset to prevent triple tap
      } else {
        lastTapTime.current = currentTime;
        // Delay single tap to check for double tap
        setTimeout(() => {
          if (lastTapTime.current === currentTime) {
            onTap?.();
          }
        }, 300);
      }
      return;
    }

    // Check for swipe gestures (only if significant movement)
    if (distance > 30 && velocity > 0.1) {
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      // Determine swipe direction based on angle
      if (angle >= -45 && angle < 45) {
        // Right swipe
        onSwipeRight?.();
      } else if (angle >= 45 && angle < 135) {
        // Down swipe
        onSwipeDown?.();
      } else if (angle >= 135 || angle < -135) {
        // Left swipe
        onSwipeLeft?.();
      } else {
        // Up swipe
        onSwipeUp?.();
      }
    }
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}