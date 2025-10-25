"use client";

import { useEffect } from "react";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export function AuthStateChecker() {
  const { 
    isAuthenticated, 
    isAdmin, 
    barbero, 
    idBarberia,
    data,
    isLoading,
    isError,
    refetch
  } = useBarberoAuth();

  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    console.log("=== AuthStateChecker ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("isAdmin:", isAdmin);
    console.log("barbero:", barbero);
    console.log("idBarberia:", idBarberia);
    console.log("isLoading:", isLoading);
    console.log("isError:", isError);
    console.log("data:", data);
    console.log("=== End AuthStateChecker ===");
    
    // Forzar una actualización si no estamos cargando y no hay datos
    if (!isLoading && !isError && data === undefined) {
      console.log("AuthStateChecker: Forzando actualización de datos");
      refetch();
    }
  }, [isAuthenticated, isAdmin, barbero, idBarberia, isLoading, isError, data, refetch]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-32 right-0 bg-purple-500 text-white p-2 text-xs z-50">
      <div className="flex flex-col gap-1">
        <span>Auth State Checker</span>
        <span>Auth: {isAuthenticated ? '✓' : '✗'}</span>
        <span>Admin: {isAdmin ? '✓' : '✗'}</span>
        <span>Loading: {isLoading ? '✓' : '✗'}</span>
        <span>Error: {isError ? '✓' : '✗'}</span>
      </div>
    </div>
  );
}