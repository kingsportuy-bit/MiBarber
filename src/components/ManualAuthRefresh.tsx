"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function ManualAuthRefresh() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log("ManualAuthRefresh: Invalidando consulta de autenticación");
      await queryClient.invalidateQueries({ queryKey: ["barberoAuth"] });
      console.log("ManualAuthRefresh: Consulta de autenticación invalidada");
    } catch (error) {
      console.error("ManualAuthRefresh: Error al invalidar consulta", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="fixed top-16 left-0 bg-green-500 text-white p-2 text-xs z-50">
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="px-2 py-1 bg-green-700 hover:bg-green-800 rounded disabled:opacity-50"
      >
        {isRefreshing ? 'Refrescando...' : 'Refrescar Auth'}
      </button>
    </div>
  );
}