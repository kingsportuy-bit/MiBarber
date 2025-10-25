"use client";

import { useEffect, useState } from "react";

export function SessionDebugger() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);

  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    const checkSession = () => {
      try {
        // Verificar localStorage
        const sessionStr = localStorage.getItem('barber_auth_session');
        
        // Verificar cookies
        const cookies = document.cookie;
        
        setSessionInfo({
          localStorage: sessionStr,
          cookies: cookies,
          timestamp: new Date().toISOString()
        });
        
        if (sessionStr) {
          try {
            const sessionData = JSON.parse(sessionStr);
            setAuthStatus({
              hasSession: true,
              sessionData: sessionData,
              user: sessionData.user || sessionData,
              isValid: !!(sessionData.user?.id || sessionData.id),
              expiresAt: sessionData.expiresAt ? new Date(sessionData.expiresAt) : null,
              isExpired: sessionData.expiresAt ? new Date(sessionData.expiresAt) < new Date() : false
            });
          } catch (parseError) {
            setAuthStatus({
              hasSession: true,
              parseError: String(parseError),
              rawSession: sessionStr
            });
          }
        } else {
          setAuthStatus({
            hasSession: false,
            reason: "No session data in localStorage"
          });
        }
      } catch (error) {
        console.error("Error in SessionDebugger:", error);
        setSessionInfo({
          error: String(error)
        });
      }
    };
    
    // Verificar inmediatamente
    checkSession();
    
    // Verificar cada 2 segundos
    const interval = setInterval(checkSession, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-blue-600 text-white p-2 text-xs z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2">
          <span>Session Debugger:</span>
          {sessionInfo && (
            <span>LS: {sessionInfo.localStorage ? '✓' : '✗'}</span>
          )}
          {authStatus && (
            <span>
              Auth: {authStatus.hasSession ? '✓' : '✗'} 
              {authStatus.hasSession && ` (${authStatus.isValid ? 'Valid' : 'Invalid'})`}
              {authStatus.isExpired && ' (Expired)'}
            </span>
          )}
        </div>
        {authStatus && (
          <div className="mt-1 text-xs">
            <span>Details: {JSON.stringify(authStatus).substring(0, 100)}...</span>
          </div>
        )}
      </div>
    </div>
  );
}