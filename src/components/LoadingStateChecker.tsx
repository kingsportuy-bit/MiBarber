"use client";

import { useState, useEffect, useCallback } from "react";

export function LoadingStateChecker() {
  const [loadingStates, setLoadingStates] = useState<any>({});
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkLoadingStates = useCallback(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    try {
      const states: any = {
        timestamp: new Date().toISOString(),
        documentReadyState: typeof document !== 'undefined' ? document.readyState : 'unknown',
        documentHidden: typeof document !== 'undefined' ? document.hidden : 'unknown',
        visibilityState: typeof document !== 'undefined' ? document.visibilityState : 'unknown'
      };
      
      if (typeof document !== 'undefined') {
        states.title = document.title;
        states.readyState = document.readyState;
        states.URL = document.URL;
      }
      
      setLoadingStates(states);
    } catch (error) {
      console.error("Error checking loading states:", error);
      setLoadingStates({ error: String(error) });
    }
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkLoadingStates();
    
    // Verificar cada 2 segundos
    const interval = setInterval(checkLoadingStates, 2000);
    
    // También escuchar eventos de cambio de estado
    if (typeof document !== 'undefined') {
      const handleReadyStateChange = () => {
        console.log("LoadingStateChecker - Ready state changed:", document.readyState);
        checkLoadingStates();
      };
      
      const handleVisibilityChange = () => {
        console.log("LoadingStateChecker - Visibility changed:", document.visibilityState);
        checkLoadingStates();
      };
      
      document.addEventListener('readystatechange', handleReadyStateChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('readystatechange', handleReadyStateChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(interval);
      };
    }
    
    return () => clearInterval(interval);
  }, [shouldShow, checkLoadingStates]);

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-80 right-0 bg-amber-600 text-black p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Loading State Checker</h3>
      <div className="max-h-32 overflow-y-auto">
        <pre className="text-xs bg-black bg-opacity-10 p-2">
          {JSON.stringify(loadingStates, null, 2)}
        </pre>
      </div>
    </div>
  );
}