"use client";

import { useEffect } from "react";

export function TempAuthChecker() {
  const shouldShow = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!shouldShow) return;
    
    const checkTempAuth = () => {
      try {
        // Verificar si hay funciones de autenticación temporal disponibles
        const isTempAuthAvailable = typeof window !== 'undefined' && 
          window.localStorage && 
          localStorage.getItem('barber_auth_session');
        
        console.log("TempAuthChecker - Temp auth available:", isTempAuthAvailable);
        
        if (isTempAuthAvailable) {
          // Verificar el contenido específico
          const sessionStr = localStorage.getItem('barber_auth_session');
          console.log("TempAuthChecker - Session string:", sessionStr);
          
          if (sessionStr) {
            try {
              const sessionData = JSON.parse(sessionStr);
              console.log("TempAuthChecker - Session data:", sessionData);
              
              // Verificar si es una sesión válida
              const isValid = !!(sessionData.user?.id || sessionData.id);
              console.log("TempAuthChecker - Session valid:", isValid);
              
              // Verificar expiración
              if (sessionData.expiresAt) {
                const expires = new Date(sessionData.expiresAt);
                const now = new Date();
                const isExpired = expires < now;
                console.log("TempAuthChecker - Session expired:", isExpired);
              }
            } catch (parseError) {
              console.error("TempAuthChecker - Error parsing session:", parseError);
            }
          }
        }
      } catch (error) {
        console.error("TempAuthChecker - Error:", error);
      }
    };
    
    // Verificar inmediatamente
    checkTempAuth();
    
    // Verificar cada 3 segundos
    const interval = setInterval(checkTempAuth, 3000);
    
    return () => clearInterval(interval);
  }, [shouldShow]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-64 left-0 bg-cyan-600 text-white p-2 text-xs z-50">
      <span>Temp Auth Checker - Check console</span>
    </div>
  );
}