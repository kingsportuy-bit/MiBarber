"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function QueryContextTest() {
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';
  
  // Mover useQueryClient al nivel superior del componente
  const queryClient = useQueryClient();
  const [contextStatus, setContextStatus] = useState<string>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    try {
      console.log("QueryContextTest: QueryClient available", queryClient);
      setContextStatus('available');
    } catch (err) {
      console.error("QueryContextTest: Error getting QueryClient", err);
      setContextStatus('error');
      setError(String(err));
    }
  }, [queryClient, shouldShow]);

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 bg-blue-600 text-white p-2 text-xs z-50">
      <div>Query Context: {contextStatus}</div>
      {error && <div>Error: {error}</div>}
    </div>
  );
}