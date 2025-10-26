"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

export function RealTimeQueryState() {
  const queryClient = useQueryClient();
  const [realTimeState, setRealTimeState] = useState<any>({});
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkRealTimeState = useCallback(() => {
    try {
      // @ts-ignore - Acceso a propiedades internas de React Query
      const queryCache = queryClient.getQueryCache();
      
      // @ts-ignore - Acceso a propiedades internas de React Query
      const queries = queryCache.getAll();
      
      const state: any = {
        timestamp: new Date().toISOString(),
        totalQueries: queries.length,
        authQueries: 0,
        loadingQueries: 0,
        errorQueries: 0,
        successQueries: 0,
        queryKeys: [] as string[]
      };
      
      queries.forEach((query: any) => {
        state.queryKeys.push(JSON.stringify(query.queryKey));
        
        if (query.queryKey && 
            Array.isArray(query.queryKey) && 
            query.queryKey.includes("barberoAuth")) {
          state.authQueries++;
        }
        
        if (query.state) {
          if (query.state.isLoading) state.loadingQueries++;
          if (query.state.isError) state.errorQueries++;
          if (query.state.isSuccess) state.successQueries++;
        }
      });
      
      setRealTimeState(state);
    } catch (error) {
      console.error("Error checking real time query state:", error);
      setRealTimeState({ error: String(error) });
    }
  }, [queryClient]);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkRealTimeState();
    
    // Verificar cada segundo
    const interval = setInterval(checkRealTimeState, 1000);
    
    return () => clearInterval(interval);
  }, [shouldShow, checkRealTimeState]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-96 left-0 bg-sky-600 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Real Time Query State</h3>
      <div className="max-h-40 overflow-y-auto">
        <pre className="text-xs bg-black bg-opacity-30 p-2">
          {JSON.stringify(realTimeState, null, 2)}
        </pre>
      </div>
    </div>
  );
}