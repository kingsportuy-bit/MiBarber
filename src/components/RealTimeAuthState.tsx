"use client";

import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useState, useEffect } from "react";

export function RealTimeAuthState() {
  const { 
    isAuthenticated, 
    isAdmin, 
    barbero, 
    idBarberia,
    isLoading,
    isError,
    error,
    data
  } = useBarberoAuth();
  
  const [authState, setAuthState] = useState<any>({});
  const shouldShow = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!shouldShow) return;
    
    const state = {
      timestamp: new Date().toISOString(),
      isAuthenticated,
      isAdmin,
      barbero: barbero ? {
        id: barbero.id_barbero,
        nombre: barbero.nombre,
        username: barbero.username,
        nivelPermisos: barbero.nivel_permisos,
        idBarberia: barbero.id_barberia
      } : null,
      idBarberia,
      isLoading,
      isError,
      error: error ? String(error) : null,
      data: data ? {
        isAuthenticated: data.isAuthenticated,
        isAdmin: data.isAdmin,
        barbero: data.barbero ? {
          id: data.barbero.id_barbero,
          nombre: data.barbero.nombre
        } : null,
        idBarberia: data.idBarberia
      } : null
    };
    
    console.log("RealTimeAuthState - Auth state:", state);
    setAuthState(state);
  }, [isAuthenticated, isAdmin, barbero, idBarberia, isLoading, isError, error, data, shouldShow]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-red-700 text-white p-2 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-1">Real Time Auth State</h3>
      <div className="max-h-20 overflow-y-auto">
        <p>Auth: {isAuthenticated ? '✓' : '✗'} | Admin: {isAdmin ? '✓' : '✗'}</p>
        <p>Loading: {isLoading ? '✓' : '✗'} | Error: {isError ? '✓' : '✗'}</p>
        {barbero && <p>Barbero: {barbero.nombre}</p>}
      </div>
    </div>
  );
}