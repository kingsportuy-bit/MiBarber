"use client";

import { useState, useEffect } from "react";

interface MobileLoaderProps {
  isLoading: boolean;
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export function MobileLoader({ 
  isLoading, 
  message = "Cargando...", 
  timeout = 10000,
  onTimeout
}: MobileLoaderProps) {
  const [showLoader, setShowLoader] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    if (isLoading) {
      // Mostrar el loader después de 300ms para evitar parpadeos
      const showTimer = setTimeout(() => {
        setShowLoader(true);
        setProgress(0);
      }, 300);

      // Actualizar la barra de progreso
      progressTimer = setInterval(() => {
        setProgress(prev => {
          // Incrementar progreso hasta 90% para dejar espacio al 100% final
          if (prev < 90) {
            return prev + 1;
          }
          return prev;
        });
      }, timeout / 100);

      // Timeout para evitar que el loader se quede atascado
      if (timeout > 0) {
        timeoutTimer = setTimeout(() => {
          setShowLoader(false);
          if (onTimeout) {
            onTimeout();
          }
        }, timeout);
      }

      return () => {
        clearTimeout(showTimer);
        clearInterval(progressTimer);
        clearTimeout(timeoutTimer);
      };
    } else {
      // Cuando termina la carga, mostrar 100% y ocultar después de 300ms
      if (showLoader) {
        setProgress(100);
        const hideTimer = setTimeout(() => {
          setShowLoader(false);
        }, 300);
        
        return () => clearTimeout(hideTimer);
      }
    }
  }, [isLoading, timeout, onTimeout, showLoader]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="flex flex-col items-center p-6 rounded-lg bg-gray-900 border border-gray-700">
        {/* Spinner de carga */}
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
          <div 
            className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"
            style={{
              borderTopColor: '#ff7700',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent'
            }}
          ></div>
        </div>
        
        {/* Mensaje */}
        <p className="text-white text-center mb-4">{message}</p>
        
        {/* Barra de progreso */}
        <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Porcentaje */}
        <span className="text-orange-500 text-sm mt-2">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}