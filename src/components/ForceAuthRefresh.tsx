"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function ForceAuthRefresh() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    console.log("ForceAuthRefresh: Component mounted");
    
    // Forzar una actualización de la consulta de autenticación
    const forceRefresh = () => {
      console.log("ForceAuthRefresh: Forzando actualización de autenticación");
      queryClient.invalidateQueries({ queryKey: ["barberoAuth"] });
    };
    
    // Ejecutar inmediatamente
    forceRefresh();
    
    // Ejecutar cada 5 segundos
    const interval = setInterval(forceRefresh, 5000);
    
    return () => clearInterval(interval);
  }, [queryClient]);
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed top-16 right-0 bg-yellow-500 text-black p-2 text-xs z-50">
      <span>Force Auth Refresh Active</span>
    </div>
  );
}