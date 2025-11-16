"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TouchProgressBarProps {
  value: number; // 0-100
  onChange?: (value: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: (value: number) => void;
  className?: string;
  showThumb?: boolean;
}

export function TouchProgressBar({
  value,
  onChange,
  onSeekStart,
  onSeekEnd,
  className = '',
  showThumb = true
}: TouchProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const thumbSize = 16;

  // Sync internal value with prop
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    onSeekStart?.();
    updateValueFromTouch(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updateValueFromTouch(e.touches[0]);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    onSeekEnd?.(currentValue);
  };

  const updateValueFromTouch = (touch: React.Touch) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    
    setCurrentValue(percentage);
    onChange?.(percentage);
  };

  const getThumbPosition = () => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    return (currentValue / 100) * rect.width - thumbSize / 2;
  };

  return (
    <div 
      ref={progressBarRef}
      className={`relative w-full h-2 bg-gray-200 rounded-full cursor-pointer ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress fill */}
      <div 
        className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
        style={{ width: `${currentValue}%` }}
      />
      
      {/* Thumb */}
      {showThumb && (
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 rounded-full bg-blue-600 border-2 border-white shadow ${
            isDragging ? 'scale-125' : ''
          }`}
          style={{
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            left: `${getThumbPosition()}px`,
            transition: isDragging ? 'none' : 'left 0.1s ease, transform 0.1s ease'
          }}
        />
      )}
    </div>
  );
}