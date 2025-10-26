"use client";

import { useState, useEffect, useCallback } from "react";

export function AppDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  const runDiagnostics = useCallback(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    try {
      const diag: any = {
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        },
        window: typeof window !== 'undefined' ? {
          location: window.location.href,
          pathname: window.location.pathname
        } : null,
        storage: typeof localStorage !== 'undefined' ? {
          available: true,
          items: localStorage.length,
          hasAuthSession: !!localStorage.getItem('barber_auth_session')
        } : {
          available: false
        },
        document: typeof document !== 'undefined' ? {
          readyState: document.readyState,
          title: document.title
        } : null
      };
      
      // Verificar sesión de autenticación
      if (typeof localStorage !== 'undefined') {
        const sessionStr = localStorage.getItem('barber_auth_session');
        if (sessionStr) {
          try {
            const sessionData = JSON.parse(sessionStr);
            diag.authSession = {
              exists: true,
              valid: !!(sessionData.user?.id || sessionData.id),
              hasUserObject: !!sessionData.user,
              userId: sessionData.user?.id || sessionData.id || null,
              expiresAt: sessionData.expiresAt ? new Date(sessionData.expiresAt).toISOString() : null,
              isExpired: sessionData.expiresAt ? new Date(sessionData.expiresAt) < new Date() : false
            };
          } catch (parseError) {
            diag.authSession = {
              exists: true,
              parseError: String(parseError)
            };
          }
        } else {
          diag.authSession = {
            exists: false
          };
        }
      }
      
      setDiagnostics(diag);
    } catch (error) {
      console.error("Error running diagnostics:", error);
      setDiagnostics({ error: String(error) });
    }
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    
    runDiagnostics();
    
    // Ejecutar cada 5 segundos
    const interval = setInterval(runDiagnostics, 5000);
    
    return () => clearInterval(interval);
  }, [shouldShow, runDiagnostics]);

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-purple-700 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">App Diagnostics</h3>
      <div className="max-h-32 overflow-y-auto">
        <pre className="text-xs bg-black bg-opacity-30 p-2">
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      </div>
    </div>
  );
}