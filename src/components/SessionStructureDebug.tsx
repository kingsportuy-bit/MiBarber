"use client";

import { useEffect } from "react";

export function SessionStructureDebug() {
  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    console.log("=== Session Structure Debug ===");
    
    try {
      // Obtener datos de localStorage
      const sessionStr = localStorage.getItem('barber_auth_session');
      console.log("Raw session string from localStorage:", sessionStr);
      
      if (sessionStr) {
        const sessionData = JSON.parse(sessionStr);
        console.log("Parsed session data:", sessionData);
        console.log("Type of parsed data:", typeof sessionData);
        
        // Verificar la estructura
        console.log("Session data keys:", Object.keys(sessionData));
        
        if (sessionData.user) {
          console.log("User object exists:", true);
          console.log("User object type:", typeof sessionData.user);
          console.log("User object keys:", Object.keys(sessionData.user));
          
          // Verificar propiedades específicas
          console.log("User ID:", sessionData.user.id);
          console.log("User ID type:", typeof sessionData.user.id);
          console.log("User name:", sessionData.user.name || sessionData.user.nombre);
          console.log("Username:", sessionData.user.username);
          console.log("Nivel permisos:", sessionData.user.nivel_permisos);
          console.log("ID Barberia:", sessionData.user.id_barberia);
          console.log("ID Sucursal:", sessionData.user.id_sucursal);
        } else {
          console.log("User object exists:", false);
        }
        
        // Verificar expiración
        if (sessionData.expiresAt) {
          console.log("ExpiresAt exists:", true);
          const expires = new Date(sessionData.expiresAt);
          const now = new Date();
          console.log("Expires at:", expires);
          console.log("Current time:", now);
          console.log("Expired:", expires < now);
        } else {
          console.log("ExpiresAt exists:", false);
        }
      } else {
        console.log("No session data found in localStorage");
      }
    } catch (error) {
      console.error("Error in SessionStructureDebug:", error);
    }
    
    console.log("=== End Session Structure Debug ===");
  }, []);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-32 left-0 right-0 bg-purple-500 text-white p-2 text-xs z-50">
      <div className="max-w-6xl mx-auto">
        <span>Session Structure Debug - Check console for details</span>
      </div>
    </div>
  );
}