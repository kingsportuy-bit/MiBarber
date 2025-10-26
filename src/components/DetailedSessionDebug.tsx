"use client";

import { useEffect, useState } from "react";

export function DetailedSessionDebug() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    try {
      // Obtener datos de localStorage
      const sessionStr = localStorage.getItem('barber_auth_session');
      setSessionData(sessionStr);
      
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        setParsedData(parsed);
        console.log("=== Detailed Session Debug ===");
        console.log("Raw session string:", sessionStr);
        console.log("Parsed session data:", parsed);
        
        // Verificar estructura esperada
        if (parsed.user) {
          console.log("User object found:", parsed.user);
          console.log("User ID:", parsed.user.id);
          console.log("User name:", parsed.user.name || parsed.user.nombre);
          console.log("Username:", parsed.user.username);
          console.log("Nivel permisos:", parsed.user.nivel_permisos);
          console.log("ID Barberia:", parsed.user.id_barberia);
          console.log("ID Sucursal:", parsed.user.id_sucursal);
        } else {
          console.log("No user object in session data");
        }
        
        // Verificar expiración
        if (parsed.expiresAt) {
          const expires = new Date(parsed.expiresAt);
          const now = new Date();
          console.log("Session expires at:", expires);
          console.log("Current time:", now);
          console.log("Session expired:", expires < now);
        } else {
          console.log("No expiration time set");
        }
        
        console.log("=== End Detailed Session Debug ===");
      } else {
        console.log("No session data found in localStorage");
      }
    } catch (err) {
      console.error("Error parsing session data:", err);
      setError(String(err));
    }
  }, []);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-yellow-500 text-black p-2 text-xs z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2">
          <span>Detailed Session Debug:</span>
          {error ? (
            <span>Error: {error}</span>
          ) : sessionData ? (
            <span>Session: {sessionData.substring(0, 100)}...</span>
          ) : (
            <span>No session data</span>
          )}
        </div>
        {parsedData && (
          <div className="mt-1">
            <span>Parsed: {JSON.stringify(parsedData).substring(0, 100)}...</span>
          </div>
        )}
      </div>
    </div>
  );
}