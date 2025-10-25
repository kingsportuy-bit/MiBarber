"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function AuthQueryDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  // Crear una consulta específica para diagnóstico
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["barberoAuth"],
    enabled: false // No ejecutar automáticamente
  });

  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    const diag: any = {
      timestamp: new Date().toISOString(),
      queryState: {
        data: data,
        isLoading: isLoading,
        isError: isError,
        error: error ? String(error) : null
      }
    };
    
    console.log("AuthQueryDiagnostics - Query state:", diag);
    setDiagnostics(diag);
  }, [data, isLoading, isError, error, shouldShow]);

  // Función para forzar la ejecución de la consulta
  const forceQuery = async () => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    try {
      console.log("AuthQueryDiagnostics - Forzando ejecución de consulta");
      await refetch();
    } catch (error) {
      console.error("AuthQueryDiagnostics - Error al forzar consulta:", error);
    }
  };

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-48 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white p-3 text-xs z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Query Diagnostics</h3>
        <button 
          onClick={forceQuery}
          className="px-2 py-1 bg-blue-900 hover:bg-blue-800 rounded text-xs"
        >
          Force Query
        </button>
      </div>
      <div className="max-h-32 overflow-y-auto">
        <p>Loading: {isLoading ? '✓' : '✗'}</p>
        <p>Error: {isError ? '✓' : '✗'}</p>
        {data ? <p>Data: {JSON.stringify(data).substring(0, 50)}...</p> : null}
        {error && <p>Error: {String(error)}</p>}
      </div>
    </div>
  );
}