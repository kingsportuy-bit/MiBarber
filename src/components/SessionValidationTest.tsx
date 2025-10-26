"use client";

import { useEffect } from "react";

export function SessionValidationTest() {
  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    console.log("=== Session Validation Test ===");
    
    try {
      // Obtener datos de localStorage
      const sessionStr = localStorage.getItem('barber_auth_session');
      console.log("Session string from localStorage:", sessionStr);
      
      if (sessionStr) {
        const sessionData = JSON.parse(sessionStr);
        console.log("Parsed session data:", sessionData);
        
        // Nueva lógica de validación
        const userData = sessionData.user || sessionData;
        console.log("User data (new logic):", userData);
        
        if (userData.id) {
          console.log("✅ User ID found:", userData.id);
          
          // Verificar otras propiedades
          console.log("User name:", userData.name || userData.nombre || "Administrador");
          console.log("Username:", userData.username);
          console.log("Nivel permisos:", userData.nivel_permisos);
          console.log("ID Barberia:", userData.id_barberia);
          
          // Verificar expiración
          if (sessionData.expiresAt) {
            const expires = new Date(sessionData.expiresAt);
            const now = new Date();
            console.log("Session expires at:", expires);
            console.log("Current time:", now);
            console.log("Session expired:", expires < now);
          } else {
            console.log("No expiration time set - session is valid");
          }
        } else {
          console.log("❌ No user ID found");
        }
      } else {
        console.log("No session data found in localStorage");
      }
    } catch (error) {
      console.error("Error in SessionValidationTest:", error);
    }
    
    console.log("=== End Session Validation Test ===");
  }, []);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-48 left-0 right-0 bg-orange-500 text-white p-2 text-xs z-50">
      <div className="max-w-6xl mx-auto">
        <span>Session Validation Test - Check console for details</span>
      </div>
    </div>
  );
}