"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

export function SpecificAuthQueryChecker() {
  const queryClient = useQueryClient();
  const [authQueryState, setAuthQueryState] = useState<any>(null);
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkAuthQuery = useCallback(() => {
    try {
      // @ts-ignore - Acceso a propiedades internas de React Query
      const queryCache = queryClient.getQueryCache();
      // @ts-ignore - Acceso a propiedades internas de React Query
      const queries = queryCache.getAll();
      
      // Buscar la consulta de autenticación específica
      const authQuery = queries.find((query: any) => 
        query.queryKey && 
        Array.isArray(query.queryKey) && 
        query.queryKey.includes("barberoAuth")
      );
      
      if (authQuery) {
        setAuthQueryState({
          queryKey: authQuery.queryKey,
          state: authQuery.state,
          data: authQuery.state.data,
          error: authQuery.state.error
        });
      } else {
        setAuthQueryState({ error: "No se encontró la consulta de autenticación" });
      }
    } catch (error) {
      console.error("Error checking auth query:", error);
      setAuthQueryState({ error: String(error) });
    }
  }, [queryClient]);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkAuthQuery();
    
    // Verificar cada 2 segundos
    const interval = setInterval(checkAuthQuery, 2000);
    
    return () => clearInterval(interval);
  }, [shouldShow, checkAuthQuery]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-48 left-0 bg-pink-600 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Auth Query Checker</h3>
      <div className="max-h-40 overflow-y-auto">
        {authQueryState ? (
          <div>
            {authQueryState.error ? (
              <p className="text-red-200">{authQueryState.error}</p>
            ) : (
              <div>
                <p><strong>Estado:</strong> {authQueryState.state?.status}</p>
                {authQueryState.data && (
                  <div className="mt-2">
                    <p><strong>Datos:</strong></p>
                    <pre className="text-xs bg-black bg-opacity-30 p-2 mt-1 overflow-x-auto">
                      {JSON.stringify(authQueryState.data, null, 2)}
                    </pre>
                  </div>
                )}
                {authQueryState.error && (
                  <div className="mt-2">
                    <p><strong>Error:</strong></p>
                    <pre className="text-xs bg-black bg-opacity-30 p-2 mt-1 overflow-x-auto">
                      {JSON.stringify(authQueryState.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-pink-200">Cargando estado de consulta...</p>
        )}
      </div>
    </div>
  );
}