"use client";

import { useState, useEffect, useCallback } from "react";

export function AuthSessionState() {
  const [sessionState, setSessionState] = useState<any>({});
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkAuthSession = useCallback(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    try {
      const state: any = {
        timestamp: new Date().toISOString()
      };
      
      // Verificar localStorage
      if (typeof localStorage !== 'undefined') {
        const sessionStr = localStorage.getItem('barber_auth_session');
        state.hasLocalStorageSession = !!sessionStr;
        
        if (sessionStr) {
          try {
            const sessionData = JSON.parse(sessionStr);
            state.sessionData = {
              hasUser: !!sessionData.user,
              hasExpiresAt: !!sessionData.expiresAt,
              userId: sessionData.user?.id || sessionData.id || null,
              username: sessionData.user?.username || sessionData.username || null,
              nivelPermisos: sessionData.user?.nivel_permisos || sessionData.nivel_permisos || null
            };
            
            // Verificar expiración
            if (sessionData.expiresAt) {
              const expires = new Date(sessionData.expiresAt);
              const now = new Date();
              state.sessionData.isExpired = expires < now;
              state.sessionData.expiresAt = expires.toISOString();
            }
          } catch (parseError) {
            state.parseError = String(parseError);
          }
        }
      }
      
      // Verificar cookies
      if (typeof document !== 'undefined') {
        state.cookies = document.cookie;
        state.hasAuthCookie = document.cookie.includes('barber_auth_session');
      }
      
      setSessionState(state);
    } catch (error) {
      console.error("Error checking auth session:", error);
      setSessionState({ error: String(error) });
    }
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkAuthSession();
    
    // Verificar cada 2 segundos
    const interval = setInterval(checkAuthSession, 2000);
    
    return () => clearInterval(interval);
  }, [shouldShow, checkAuthSession]);

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-80 left-0 bg-fuchsia-600 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Auth Session State</h3>
      <div className="max-h-40 overflow-y-auto">
        <pre className="text-xs bg-black bg-opacity-30 p-2">
          {JSON.stringify(sessionState, null, 2)}
        </pre>
      </div>
    </div>
  );
}