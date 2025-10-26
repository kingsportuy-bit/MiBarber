"use client";

import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useState, useEffect } from "react";

export function HookStateChecker() {
  const hookState = useBarberoAuth();
  const [detailedState, setDetailedState] = useState<any>({});
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    const state: any = {
      timestamp: new Date().toISOString(),
      hookState: {
        isAuthenticated: hookState.isAuthenticated,
        isAdmin: hookState.isAdmin,
        barbero: hookState.barbero ? {
          id: hookState.barbero.id_barbero,
          nombre: hookState.barbero.nombre,
          username: hookState.barbero.username,
          nivelPermisos: hookState.barbero.nivel_permisos
        } : null,
        idBarberia: hookState.idBarberia,
        isLoading: hookState.isLoading,
        isError: hookState.isError,
        error: hookState.error ? String(hookState.error) : null,
        data: hookState.data
      }
    };
    
    console.log("HookStateChecker - Hook state:", state);
    setDetailedState(state);
  }, [hookState, shouldShow]);

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-96 right-0 bg-teal-700 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Hook State Checker</h3>
      <div className="max-h-40 overflow-y-auto">
        <pre className="text-xs bg-black bg-opacity-30 p-2">
          {JSON.stringify(detailedState, null, 2)}
        </pre>
      </div>
    </div>
  );
}