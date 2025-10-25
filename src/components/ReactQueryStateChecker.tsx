"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

export function ReactQueryStateChecker() {
  const queryClient = useQueryClient();
  const [queryState, setQueryState] = useState<any>(null);
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkQueryState = useCallback(() => {
    try {
      // @ts-ignore - Acceso a propiedades internas de React Query
      const queryCache = queryClient.getQueryCache();
      // @ts-ignore - Acceso a propiedades internas de React Query
      const queries = queryCache.getAll();
      
      const state = {
        queryCount: queries.length,
        queries: queries.map((query: any) => ({
          queryKey: query.queryKey,
          state: query.state.status,
          data: query.state.data,
          error: query.state.error,
          isLoading: query.state.isLoading,
          isError: query.state.isError,
          isSuccess: query.state.isSuccess
        }))
      };
      
      setQueryState(state);
    } catch (error) {
      console.error("Error checking query state:", error);
      setQueryState({ error: String(error) });
    }
  }, [queryClient]);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkQueryState();
    
    // Verificar cada 3 segundos
    const interval = setInterval(checkQueryState, 3000);
    
    return () => clearInterval(interval);
  }, [shouldShow, checkQueryState]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-32 left-0 bg-orange-600 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">React Query State Checker</h3>
      <div className="max-h-40 overflow-y-auto">
        {queryState ? (
          <div>
            <p>Total queries: {queryState.queryCount}</p>
            {queryState.queries && queryState.queries.map((query: any, index: number) => (
              <div key={index} className="border-b border-orange-500 pb-1 mb-1">
                <p><strong>Key:</strong> {JSON.stringify(query.queryKey)}</p>
                <p><strong>Status:</strong> {query.state}</p>
                {query.queryKey.includes("barberoAuth") && (
                  <div className="ml-2">
                    <p><strong>Auth Data:</strong> {JSON.stringify(query.data)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-orange-200">Cargando estado...</p>
        )}
      </div>
    </div>
  );
}