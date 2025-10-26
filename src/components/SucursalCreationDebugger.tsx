"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface DebugInfo {
  step: string;
  timestamp: string;
  columns?: any;
  columnsError?: any;
  testData?: any;
  result?: any;
  error?: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  };
}

export function SucursalCreationDebugger() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  const runTest = async () => {
    setIsTesting(true);
    setDebugInfo({ step: "Iniciando diagnóstico", timestamp: new Date().toISOString() });
    
    try {
      const supabase = getSupabaseClient();
      
      // 1. Verificar estructura de la tabla
      setDebugInfo(prev => ({ ...prev as DebugInfo, step: "Verificando estructura de tabla" }));
      
      const { data: columns, error: columnsError } = await supabase
        .from('mibarber_sucursales')
        .select('*')
        .limit(0);
      
      // 2. Verificar si la columna 'horario' existe
      setDebugInfo(prev => ({ ...prev as DebugInfo, step: "Verificando columna horario" }));
      
      // 3. Intentar crear una sucursal de prueba
      setDebugInfo(prev => ({ ...prev as DebugInfo, step: "Creando sucursal de prueba" }));
      
      const testData = {
        id_barberia: '00000000-0000-0000-0000-000000000000', // ID de prueba
        numero_sucursal: 999,
        nombre_sucursal: 'Sucursal de Prueba',
        direccion: 'Dirección de prueba',
        telefono: '123456789',
        celular: '987654321',
        horario: 'Lun-Vie: 9:00-18:00'
      };
      
      const { data, error } = await supabase
        .from('mibarber_sucursales')
        .insert([testData] as any)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // 4. Eliminar la sucursal de prueba
      setDebugInfo(prev => ({ ...prev as DebugInfo, step: "Eliminando sucursal de prueba" }));
      
      await supabase
        .from('mibarber_sucursales')
        .delete()
        .eq('id', (data as any).id);
      
      setDebugInfo({
        step: "Diagnóstico completado exitosamente",
        columns,
        columnsError,
        testData,
        result: data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error en diagnóstico:", error);
      setDebugInfo({
        step: "Error en diagnóstico",
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="p-4 bg-qoder-dark-bg-form rounded-lg">
      <h3 className="text-lg font-bold text-qoder-dark-text-primary mb-4">Depurador de Creación de Sucursales</h3>
      
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
            
            {debugInfo.columns && (
              <div className="mt-2">
                <p><strong>Estructura de tabla:</strong></p>
                <pre className="text-gray-100 bg-gray-900 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.columns, null, 2)}
                </pre>
              </div>
            )}
            
            {debugInfo.columnsError && (
              <div className="mt-2">
                <p><strong>Error en estructura:</strong></p>
                <pre className="text-red-100 bg-gray-900 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.columnsError, null, 2)}
                </pre>
              </div>
            )}
            
            {debugInfo.testData && (
              <div className="mt-2">
                <p><strong>Datos de prueba:</strong></p>
                <pre className="text-gray-100 bg-gray-900 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.testData, null, 2)}
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