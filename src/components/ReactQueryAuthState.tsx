"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

export function ReactQueryAuthState() {
  const queryClient = useQueryClient();
  const [queryState, setQueryState] = useState<any>(null);
  const shouldShow = process.env.NODE_ENV === 'development';

  // Obtener directamente el estado de la consulta de autenticación
  const authQuery = useQuery({
    queryKey: ["barberoAuth"],
    enabled: false // No ejecutar automáticamente
  });

  const getState = useCallback(() => {
    try {
      const state = queryClient.getQueryState(["barberoAuth"]);
      console.log("ReactQueryAuthState - Query state:", state);
      setQueryState(state);
    } catch (error) {
      console.error("ReactQueryAuthState - Error getting query state:", error);
      setQueryState({ error: String(error) });
    }
  }, [queryClient]);

  useEffect(() => {
    if (!shouldShow) return;
    
    console.log("ReactQueryAuthState - useQuery result:", authQuery);
    
    getState();
    
    // Verificar cada 2 segundos
    const interval = setInterval(getState, 2000);
    
    return () => clearInterval(interval);
  }, [shouldShow, authQuery, getState]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-80 left-0 bg-emerald-600 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">React Query Auth State</h3>
      <div className="max-h-40 overflow-y-auto">
        <p><strong>useQuery data:</strong></p>
        <pre className="text-xs bg-black bg-opacity-30 p-2 mt-1 overflow-x-auto">
          {JSON.stringify(authQuery.data, null, 2)}
        </pre>
        <p className="mt-2"><strong>Query state:</strong></p>
        <pre className="text-xs bg-black bg-opacity-30 p-2 mt-1 overflow-x-auto">
          {JSON.stringify(queryState, null, 2)}
        </pre>
      </div>
    </div>
  );
}