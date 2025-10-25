"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

export function QueryCacheState() {
  const queryClient = useQueryClient();
  const [cacheState, setCacheState] = useState<any>({});
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkCacheState = useCallback(() => {
    try {
      // @ts-ignore - Acceso a propiedades internas de React Query
      const queryCache = queryClient.getQueryCache();
      
      // @ts-ignore - Acceso a propiedades internas de React Query
      const queries = queryCache.getAll();
      
      const state: any = {
        timestamp: new Date().toISOString(),
        cacheSize: queries.length,
        queries: [] as any[]
      };
      
      // Limitar a las primeras 10 consultas para evitar sobrecarga
      const limitedQueries = queries.slice(0, 10);
      
      limitedQueries.forEach((query: any) => {
        state.queries.push({
          queryKey: query.queryKey,
          state: {
            status: query.state?.status,
            isLoading: query.state?.isLoading,
            isError: query.state?.isError,
            isSuccess: query.state?.isSuccess,
            data: query.state?.data ? 
              (typeof query.state.data === 'object' ? 
                JSON.stringify(query.state.data).substring(0, 100) + '...' : 
                String(query.state.data)) : 
              null,
            error: query.state?.error ? String(query.state.error) : null
          }
        });
      });
      
      setCacheState(state);
    } catch (error) {
      console.error("Error checking query cache state:", error);
      setCacheState({ error: String(error) });
    }
  }, [queryClient]);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkCacheState();
    
    // Verificar cada 3 segundos
    const interval = setInterval(checkCacheState, 3000);
    
    return () => clearInterval(interval);
  }, [shouldShow, checkCacheState]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-96 right-0 bg-indigo-700 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Query Cache State</h3>
      <div className="max-h-40 overflow-y-auto">
        <pre className="text-xs bg-black bg-opacity-30 p-2">
          {JSON.stringify(cacheState, null, 2)}
        </pre>
      </div>
    </div>
  );
}