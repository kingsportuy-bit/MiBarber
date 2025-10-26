"use client";

import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useState, useEffect } from "react";

export function HookDiagnostics() {
  const hookData = useBarberoAuth();
  const [diagnostics, setDiagnostics] = useState<any>({});
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    const diag: any = {
      timestamp: new Date().toISOString(),
      hookData: {
        isAuthenticated: hookData.isAuthenticated,
        isAdmin: hookData.isAdmin,
        barbero: hookData.barbero ? {
          id: hookData.barbero.id_barbero,
          nombre: hookData.barbero.nombre,
          username: hookData.barbero.username,
          nivelPermisos: hookData.barbero.nivel_permisos
        } : null,
        idBarberia: hookData.idBarberia,
        isLoading: hookData.isLoading,
        isError: hookData.isError,
        error: hookData.error ? String(hookData.error) : null,
        data: hookData.data
      }
    };
    
    console.log("HookDiagnostics - Hook data:", diag);
    setDiagnostics(diag);
  }, [hookData, shouldShow]);

  // También ejecutar una verificación manual
  const forceCheck = () => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    console.log("HookDiagnostics - Forzando verificación");
    // @ts-ignore - Acceso a función interna
    if (hookData.refetch) {
      // @ts-ignore - Acceso a función interna
      hookData.refetch();
    }
  };

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-32 left-1/2 transform -translate-x-1/2 bg-green-700 text-white p-3 text-xs z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Hook Diagnostics</h3>
        <button 
          onClick={forceCheck}
          className="px-2 py-1 bg-green-900 hover:bg-green-800 rounded text-xs"
        >
          Force Check
        </button>
      </div>
      <div className="max-h-32 overflow-y-auto">
        <p>Auth: {hookData.isAuthenticated ? '✓' : '✗'}</p>
        <p>Admin: {hookData.isAdmin ? '✓' : '✗'}</p>
        <p>Loading: {hookData.isLoading ? '✓' : '✗'}</p>
        <p>Error: {hookData.isError ? '✓' : '✗'}</p>
        {hookData.barbero && <p>Barbero: {hookData.barbero.nombre}</p>}
      </div>
    </div>
  );
}