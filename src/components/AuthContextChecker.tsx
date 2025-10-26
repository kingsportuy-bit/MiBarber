"use client";

import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useEffect } from "react";

export function AuthContextChecker() {
  const auth = useBarberoAuth();
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    console.log("=== AuthContextChecker ===");
    console.log("useBarberoAuth result:", auth);
    console.log("isAuthenticated:", auth.isAuthenticated);
    console.log("isAdmin:", auth.isAdmin);
    console.log("barbero:", auth.barbero);
    console.log("idBarberia:", auth.idBarberia);
    console.log("isLoading:", auth.isLoading);
    console.log("isError:", auth.isError);
    console.log("data:", auth.data);
    console.log("error:", auth.error);
    console.log("=== End AuthContextChecker ===");
  }, [auth, shouldShow]);

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-64 right-0 bg-lime-600 text-white p-2 text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-1">Auth Context Checker</h3>
      <div className="space-y-1">
        <p>Auth: {auth.isAuthenticated ? '✓' : '✗'}</p>
        <p>Admin: {auth.isAdmin ? '✓' : '✗'}</p>
        <p>Loading: {auth.isLoading ? '✓' : '✗'}</p>
        <p>Error: {auth.isError ? '✓' : '✗'}</p>
        {auth.barbero && (
          <p>Barbero: {auth.barbero.nombre}</p>
        )}
      </div>
    </div>
  );
}