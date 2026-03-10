"use client";

import { useState, useEffect, useRef } from "react";

interface VirtualKeyboardHandlerProps {
  children: React.ReactNode;
  onKeyboardShow?: () => void;
  onKeyboardHide?: () => void;
}

export function VirtualKeyboardHandler({
  children,
  onKeyboardShow,
  onKeyboardHide
}: VirtualKeyboardHandlerProps) {
  const [viewportHeight, setViewportHeight] = useState<number | string>('100%');
  const initialViewportHeight = useRef(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;

      const currentHeight = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(currentHeight);

      if (initialViewportHeight.current === 0) {
        initialViewportHeight.current = currentHeight;
      }

      const heightDifference = initialViewportHeight.current - currentHeight;
      const keyboardThreshold = 150;

      if (heightDifference > keyboardThreshold) {
        if (!isKeyboardVisible) {
          setIsKeyboardVisible(true);
          if (onKeyboardShow) onKeyboardShow();
        }
      } else {
        if (isKeyboardVisible) {
          setIsKeyboardVisible(false);
          if (onKeyboardHide) onKeyboardHide();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [isKeyboardVisible, onKeyboardShow, onKeyboardHide]);

  return (
    <div
      className="w-full relative overflow-hidden flex flex-col"
      style={{
        height: viewportHeight,
        transition: 'height 0.1s ease-out'
      }}
    >
      {children}
    </div>
  );
}