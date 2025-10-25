"use client";

import { useState, useEffect, useCallback } from "react";

export function CookieChecker() {
  const [cookies, setCookies] = useState<string>("");
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkCookies = useCallback(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    try {
      setCookies(document.cookie);
    } catch (error) {
      console.error("Error reading cookies:", error);
      setCookies(`Error: ${error}`);
    }
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkCookies();
    
    // Verificar cada 3 segundos
    const interval = setInterval(checkCookies, 3000);
    
    return () => clearInterval(interval);
  }, [shouldShow, checkCookies]);

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-48 right-0 bg-yellow-600 text-black p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Cookie Checker</h3>
      <div className="max-h-32 overflow-y-auto">
        {cookies ? (
          <div>
            <p><strong>Cookies:</strong></p>
            <p className="bg-black bg-opacity-10 p-2 mt-1 break-words">
              {cookies}
            </p>
          </div>
        ) : (
          <p className="text-yellow-800">No hay cookies</p>
        )}
      </div>
    </div>
  );
}