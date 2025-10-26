"use client";

import { useEffect } from "react";

export function SessionChecker() {
  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    console.log("=== Session Checker ===");
    
    // Verificar localStorage
    try {
      const sessionStr = localStorage.getItem('barber_auth_session');
      console.log("localStorage barber_auth_session:", sessionStr);
      
      if (sessionStr) {
        const sessionData = JSON.parse(sessionStr);
        console.log("Parsed session data:", sessionData);
        
        // Verificar estructura
        if (sessionData.user) {
          console.log("User data:", sessionData.user);
          console.log("User ID:", sessionData.user.id);
          console.log("User name:", sessionData.user.name || sessionData.user.nombre);
          console.log("Nivel permisos:", sessionData.user.nivel_permisos);
          console.log("ID Barberia:", sessionData.user.id_barberia);
        } else {
          console.log("No user data in session");
          // Verificar si los datos están directamente en sessionData
          console.log("Direct session data:", sessionData);
          console.log("Direct User ID:", sessionData.id);
          console.log("Direct User name:", sessionData.name || sessionData.nombre);
          console.log("Direct Nivel permisos:", sessionData.nivel_permisos);
          console.log("Direct ID Barberia:", sessionData.id_barberia);
        }
        
        // Verificar expiración
        if (sessionData.expiresAt) {
          const expires = new Date(sessionData.expiresAt);
          const now = new Date();
          console.log("Expires at:", expires);
          console.log("Current time:", now);
          console.log("Expired:", expires < now);
        }
      } else {
        console.log("No session found in localStorage");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
    
    // Verificar cookies
    console.log("Document cookie:", document.cookie);
    
    console.log("=== End Session Checker ===");
  }, []);
  
  return null;
}