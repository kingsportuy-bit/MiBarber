"use client";

import { useState, useEffect, useCallback } from "react";

export function AppStateChecker() {
  const [appState, setAppState] = useState<any>({});
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkAppState = useCallback(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    try {
      const state: any = {
        timestamp: new Date().toISOString(),
        window: typeof window !== 'undefined' ? 'available' : 'not available',
        localStorage: typeof localStorage !== 'undefined' ? 'available' : 'not available',
        document: typeof document !== 'undefined' ? 'available' : 'not available'
      };
      
      if (typeof window !== 'undefined') {
        state.location = window.location.href;
        state.pathname = window.location.pathname;
        state.hostname = window.location.hostname;
      }
      
      if (typeof localStorage !== 'undefined') {
        state.localStorageItems = localStorage.length;
        state.hasBarberAuth = !!localStorage.getItem('barber_auth_session');
        if (state.hasBarberAuth) {
          try {
            const session = localStorage.getItem('barber_auth_session');
            state.sessionLength = session?.length;
            state.sessionParsed = JSON.parse(session || 'null');
          } catch (e) {
            state.sessionParseError = String(e);
          }
        }
      }
      
      setAppState(state);
    } catch (error) {
      console.error("Error checking app state:", error);
      setAppState({ error: String(error) });
    }
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkAppState();
    
    // Verificar cada 3 segundos
    const interval = setInterval(checkAppState, 3000);
    
    return () => clearInterval(interval);
  }, [shouldShow, checkAppState]);

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-80 right-0 bg-violet-600 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">App State Checker</h3>
      <div className="max-h-40 overflow-y-auto">
        <pre className="text-xs bg-black bg-opacity-30 p-2">
          {JSON.stringify(appState, null, 2)}
        </pre>
      </div>
    </div>
  );
}