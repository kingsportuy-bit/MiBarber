"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function ForceAllRefresh() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log("ForceAllRefresh: Invalidando todas las consultas");
      await queryClient.invalidateQueries();
      console.log("ForceAllRefresh: Todas las consultas invalidadas");
    } catch (error) {
      console.error("ForceAllRefresh: Error al invalidar consultas", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="fixed top-16 left-32 bg-red-500 text-white p-2 text-xs z-50">
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="px-2 py-1 bg-red-700 hover:bg-red-800 rounded disabled:opacity-50"
      >
        {isRefreshing ? 'Refrescando...' : 'Refrescar Todo'}
      </button>
    </div>
  );
}