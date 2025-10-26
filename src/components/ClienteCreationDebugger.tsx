"use client";

import { useState } from "react";
import { useClientes } from "@/hooks/useClientes";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

interface DebugInfo {
  step: string;
  timestamp: string;
  data?: any;
  result?: any;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

export function ClienteCreationDebugger() {
  const { createMutation } = useClientes();
  const { idBarberia } = useBarberoAuth();
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  const runTest = async () => {
    setIsTesting(true);
    setDebugInfo({ step: "Iniciando diagnóstico", timestamp: new Date().toISOString() });
    
    try {
      // Datos de prueba
      const testData = {
        nombre: "Cliente de Prueba",
        telefono: "123456789",
        id_barberia: idBarberia,
        // id_sucursal no lo incluimos para evitar problemas
      };
      
      setDebugInfo(prev => ({ 
        ...prev as DebugInfo, 
        step: "Datos de prueba preparados", 
        data: testData 
      }));
      
      // Intentar crear el cliente
      const result = await createMutation.mutateAsync(testData);
      
      setDebugInfo({
        step: "Cliente creado exitosamente",
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error en diagnóstico:", error);
      setDebugInfo({
        step: "Error en diagnóstico",
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="p-4 bg-qoder-dark-bg-form rounded-lg">
      <h3 className="text-lg font-bold text-qoder-dark-text-primary mb-4">Depurador de Creación de Clientes</h3>
      
      <button 
        onClick={runTest}
        disabled={isTesting}
        className="qoder-dark-button-primary mb-4"
      >
        {isTesting ? "Diagnosticando..." : "Ejecutar Diagnóstico"}
      </button>
      
      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <h4 className="font-bold text-gray-200 mb-2">Información de Depuración:</h4>
          <div className="text-sm">
            <p><strong>Paso:</strong> {debugInfo.step}</p>
            <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
            
            {debugInfo.data && (
              <div className="mt-2">
                <p><strong>Datos enviados:</strong></p>
                <pre className="text-gray-100 bg-gray-900 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.data, null, 2)}
                </pre>
              </div>
            )}
            
            {debugInfo.result && (
              <div className="mt-2">
                <p><strong>Resultado:</strong></p>
                <pre className="text-green-100 bg-gray-900 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.result, null, 2)}
                </pre>
              </div>
            )}
            
            {debugInfo.error && (
              <div className="mt-2">
                <p><strong>Error:</strong></p>
                <pre className="text-red-100 bg-gray-900 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}