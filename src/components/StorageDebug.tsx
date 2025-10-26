"use client";

import { useEffect, useState } from "react";

export function StorageDebug() {
  const [storageData, setStorageData] = useState<any>(null);
  
  useEffect(() => {
    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    const checkStorage = () => {
      try {
        const sessionStr = localStorage.getItem('barber_auth_session');
        if (sessionStr) {
          const sessionData = JSON.parse(sessionStr);
          setStorageData(sessionData);
        } else {
          setStorageData(null);
        }
      } catch (error) {
        console.error("Error leyendo localStorage:", error);
        setStorageData({ error: "Error leyendo localStorage" });
      }
    };
    
    // Verificar inmediatamente
    checkStorage();
    
    // Verificar cada 2 segundos
    const interval = setInterval(checkStorage, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-10 left-0 right-0 bg-blue-500 text-white p-2 text-xs z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2">
          <span>Storage Debug:</span>
          {storageData ? (
            <span>Session: {JSON.stringify(storageData)}</span>
          ) : (
            <span>No session data</span>
          )}
        </div>
      </div>
    </div>
  );
}