"use client";

import { useState, useEffect, useCallback } from "react";

export function LocalStorageChecker() {
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  
  // Mover la verificación al interior del hook
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkLocalStorage = useCallback(() => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    try {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[key] = localStorage.getItem(key) || '';
        }
      }
      setLocalStorageData(data);
    } catch (error) {
      console.error("Error reading localStorage:", error);
    }
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    
    checkLocalStorage();
    
    // Verificar cada 3 segundos
    const interval = setInterval(checkLocalStorage, 3000);
    
    return () => clearInterval(interval);
  }, [shouldShow, checkLocalStorage]);

  const handleCopy = () => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    const dataStr = JSON.stringify(localStorageData, null, 2);
    navigator.clipboard.writeText(dataStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearAuth = () => {
    // Solo ejecutar en desarrollo
    if (!shouldShow) return;
    
    if (confirm("¿Estás seguro de que quieres eliminar los datos de autenticación?")) {
      localStorage.removeItem('barber_auth_session');
      document.cookie = "barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      checkLocalStorage();
    }
  };

  // Mover el retorno condicional al final
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 bg-gray-800 text-white p-3 text-xs z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">LocalStorage Checker</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <button 
            onClick={handleClearAuth}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            Limpiar Auth
          </button>
        </div>
      </div>
      <div className="max-h-40 overflow-y-auto">
        {Object.keys(localStorageData).length > 0 ? (
          <ul className="space-y-1">
            {Object.entries(localStorageData).map(([key, value]) => (
              <li key={key} className="border-b border-gray-700 pb-1">
                <strong>{key}:</strong> {value.substring(0, 50)}{value.length > 50 ? '...' : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No hay datos en localStorage</p>
        )}
      </div>
    </div>
  );
}