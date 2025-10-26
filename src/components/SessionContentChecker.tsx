"use client";

import { useState, useEffect } from "react";

export function SessionContentChecker() {
  const [sessionContent, setSessionContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const shouldShow = process.env.NODE_ENV === 'development';

  const checkSessionContent = () => {
    try {
      const sessionStr = localStorage.getItem('barber_auth_session');
      
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        setSessionContent(parsed);
        setError(null);
      } else {
        setSessionContent(null);
        setError("No hay sesión en localStorage");
      }
    } catch (err) {
      setSessionContent(null);
      setError(`Error parseando sesión: ${err}`);
    }
  };

  useEffect(() => {
    if (!shouldShow) return;
    
    checkSessionContent();
    
    // Verificar cada 3 segundos
    const interval = setInterval(checkSessionContent, 3000);
    
    return () => clearInterval(interval);
  }, [shouldShow]);

  // Mover el retorno condicional al final del componente
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-32 right-0 bg-teal-600 text-white p-3 text-xs z-50 max-w-md">
      <h3 className="font-bold mb-2">Session Content Checker</h3>
      <div className="max-h-40 overflow-y-auto">
        {error ? (
          <p className="text-red-200">{error}</p>
        ) : sessionContent ? (
          <div>
            <p className="mb-1"><strong>Estructura:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>expiresAt: {sessionContent.expiresAt ? new Date(sessionContent.expiresAt).toLocaleString() : 'No definido'}</li>
              <li>user: {sessionContent.user ? '✓ (objeto)' : '✗ (no existe)'}</li>
              {sessionContent.user && (
                <>
                  <li className="ml-4">user.id: {sessionContent.user.id || 'No definido'}</li>
                  <li className="ml-4">user.name: {sessionContent.user.name || sessionContent.user.nombre || 'No definido'}</li>
                  <li className="ml-4">user.username: {sessionContent.user.username || 'No definido'}</li>
                  <li className="ml-4">user.nivel_permisos: {sessionContent.user.nivel_permisos !== undefined ? sessionContent.user.nivel_permisos : 'No definido'}</li>
                </>
              )}
              {!sessionContent.user && (
                <>
                  <li className="ml-4">id: {sessionContent.id || 'No definido'}</li>
                  <li className="ml-4">name: {sessionContent.name || sessionContent.nombre || 'No definido'}</li>
                  <li className="ml-4">username: {sessionContent.username || 'No definido'}</li>
                  <li className="ml-4">nivel_permisos: {sessionContent.nivel_permisos !== undefined ? sessionContent.nivel_permisos : 'No definido'}</li>
                </>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-gray-200">No hay datos de sesión</p>
        )}
      </div>
    </div>
  );
}