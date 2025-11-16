"use client";

import React, { useState, useRef, useEffect } from 'react';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  className?: string;
}

export function SwipeableListItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActions,
  rightActions,
  className = ''
}: SwipeableListItemProps) {
  const [position, setPosition] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [thresholdReached, setThresholdReached] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startPosition = useRef(0);
  const threshold = 80; // Minimum swipe distance to trigger action

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSwiping(true);
    startX.current = e.touches[0].clientX;
    startPosition.current = position;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    const newPosition = startPosition.current + deltaX;
    
    // Limit swipe distance
    const maxSwipe = containerRef.current ? containerRef.current.offsetWidth * 0.5 : 200;
    const clampedPosition = Math.max(Math.min(newPosition, maxSwipe), -maxSwipe);
    
    setPosition(clampedPosition);
    
    // Check if threshold is reached for visual feedback
    setThresholdReached(Math.abs(clampedPosition) > threshold);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    
    // Trigger action if threshold is reached
    if (Math.abs(position) > threshold) {
      if (position > 0 && onSwipeRight) {
        // Swipe right
        onSwipeRight();
        setPosition(0); // Reset position after action
      } else if (position < 0 && onSwipeLeft) {
        // Swipe left
        onSwipeLeft();
        setPosition(0); // Reset position after action
      } else {
        // Reset position if no action is defined
        setPosition(0);
      }
    } else {
      // Not enough swipe, reset position
      setPosition(0);
    }
    
    setThresholdReached(false);
  };

  // Reset position when component unmounts or actions change
  useEffect(() => {
    return () => {
      setPosition(0);
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      {leftActions && (
        <div 
          className={`absolute top-0 left-0 h-full flex items-center transition-opacity duration-200 ${
            position > threshold ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: `${Math.max(0, position)}px` }}
        >
          {leftActions}
        </div>
      )}
      
      {rightActions && (
        <div 
          className={`absolute top-0 right-0 h-full flex items-center transition-opacity duration-200 ${
            position < -threshold ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: `${Math.max(0, -position)}px` }}
        >
          {rightActions}
        </div>
      )}
      
      {/* Main content */}
      <div
        ref={containerRef}
        className={`relative transition-transform duration-200 ease-out ${className} ${
          thresholdReached ? 'scale-95' : ''
        }`}
        style={{
          transform: `translateX(${position}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}