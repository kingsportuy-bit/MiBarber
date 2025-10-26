"use client";

import { useState, useEffect, useCallback } from "react";

export function RealTimeAppState() {
  const [realTimeState, setRealTimeState] = useState<any>({});
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkRealTimeState = useCallback(() => {
    try {
      const state: any = {
        timestamp: new Date().toISOString(),
        performance: typeof performance !== 'undefined' ? {
          now: performance.now(),
          memory: (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          } : null
        } : null,
        navigator: typeof navigator !== 'undefined' ? {
          userAgent: navigator.userAgent,
          language: navigator.language,
          onLine: navigator.onLine
        } : null,
        screen: typeof screen !== 'undefined' ? {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight
        } : null
      };
      
      // Verificar estado de red
      if (typeof navigator !== 'undefined') {
        state.network = {
          onLine: navigator.onLine
        };
      }
      
      // Verificar visibilidad
      if (typeof document !== 'undefined') {
        state.visibility = {
          hidden: document.hidden,
          visibilityState: document.visibilityState
        };
      }
      
      setRealTimeState(state);
    } catch (error) {
      console.error("Error checking real time app state:", error);
      setRealTimeState({ error: String(error) });
    }
  }, []);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkRealTimeState();
    
    // Verificar cada 5 segundos
    const interval = setInterval(checkRealTimeState, 5000);
    
    // Escuchar eventos de cambio de visibilidad
    if (typeof document !== 'undefined') {
      const handleVisibilityChange = () => {
        checkRealTimeState();
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(interval);
      };
    }
    
    return () => clearInterval(interval);
  }, [shouldShow, checkRealTimeState]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-96 left-0 bg-orange-600 text-black p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Real Time App State</h3>
      <div className="max-h-40 overflow-y-auto">
        <pre className="text-xs bg-black bg-opacity-10 p-2">
          {JSON.stringify(realTimeState, null, 2)}
        </pre>
      </div>
    </div>
  );
}