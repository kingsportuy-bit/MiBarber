"use client";

import { useState } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { getLocalDateString } from "@/utils/dateUtils";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from "@/types/db";

interface DebugInfo {
  step: string;
  timestamp: string;
  data?: any;
  result?: any;
  error?: {
    message: string;
    stack?: string;
    name?: string;
    details?: string;
    hint?: string;
    code?: string;
  };
  missingFields?: string[];
}

export function CitaCreationDebugger() {
  const { idBarberia, barbero } = useBarberoAuth();
  const { sucursales } = useSucursales(idBarberia || undefined);
  const { createMutation } = useCitas();
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testMethod, setTestMethod] = useState<'hook' | 'direct'>('hook');
  
  const runHookTest = async () => {
    setIsTesting(true);
    setDebugInfo({ step: "Iniciando prueba con hook", timestamp: new Date().toISOString() });
    
    try {
      // Datos de prueba
      const testData: Omit<Appointment, "id_cita"> = {
        fecha: getLocalDateString(),
        hora: "10:00",
        cliente_nombre: "Cliente de Prueba",
        servicio: "Corte de Cabello",
        barbero: barbero?.nombre || "Barbero de Prueba",
        id_sucursal: sucursales && sucursales.length > 0 ? sucursales[0]?.id : null,
        id_barberia: idBarberia || null,
        estado: "pendiente",
        creado: new Date().toISOString(),
        duracion: "30m",
        nota: null,
        id_cliente: null,
        notificacion_barbero: null,
        notificacion_cliente: null,
        ticket: null,
        nro_factura: null,
        metodo_pago: null,
        id_barbero: null,
        id_servicio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setDebugInfo(prev => ({ ...prev as DebugInfo, step: "Datos de prueba preparados", data: testData }));
      
      // Validación de datos requeridos
      const requiredFields = ["fecha", "hora", "cliente_nombre", "servicio", "barbero", "id_sucursal", "id_barberia"];
      const missingFields = requiredFields.filter(field => !testData[field as keyof typeof testData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos faltantes: ${missingFields.join(", ")}`);
      }
      
      setDebugInfo(prev => ({ ...prev as DebugInfo, step: "Validación completada", missingFields }));
      
      // Intentar crear la cita
      const result = await createMutation.mutateAsync(testData);
      
      setDebugInfo({
        step: "Cita creada exitosamente con hook",
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error en prueba con hook:", error);
      setDebugInfo({
        step: "Error en prueba con hook",
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
  
  const runDirectTest = async () => {
    setIsTesting(true);
    setDebugInfo({ step: "Iniciando prueba directa", timestamp: new Date().toISOString() });
    
    try {
      const supabase = getSupabaseClient();
      
      // Datos de prueba
      const testData: Omit<Appointment, "id_cita"> = {
        fecha: getLocalDateString(),
        hora: "10:00:00",
        cliente_nombre: "Cliente de Prueba Directa",
        servicio: "Corte de Cabello",
        barbero: barbero?.nombre || "Barbero de Prueba",
        id_sucursal: sucursales && sucursales.length > 0 ? sucursales[0]?.id : null,
        id_barberia: idBarberia || null,
        estado: "pendiente",
        creado: new Date().toISOString(),
        duracion: "30m",
        nota: null,
        id_cliente: null,
        notificacion_barbero: null,
        notificacion_cliente: null,
        ticket: null,
        nro_factura: null,
        metodo_pago: null,
        id_barbero: null,
        id_servicio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setDebugInfo(prev => ({ ...prev as DebugInfo, step: "Datos de prueba preparados para inserción directa", data: testData }));
      
      // Intentar insertar directamente
      const { data, error } = await (supabase as any)
        .from('mibarber_citas')
        .insert([testData])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setDebugInfo({
        step: "Cita creada exitosamente con inserción directa",
        result: data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error en prueba directa:", error);
      setDebugInfo({
        step: "Error en prueba directa",
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
  
  const runTest = async () => {
    if (testMethod === 'hook') {
      await runHookTest();
    } else {
      await runDirectTest();
    }
  };
  
  return (
    <div className="p-4 bg-qoder-dark-bg-form rounded-lg">
      <h3 className="text-lg font-bold text-qoder-dark-text-primary mb-4">Depurador de Creación de Citas</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-qoder-dark-text-primary mb-2">
          Método de prueba:
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="testMethod"
              value="hook"
              checked={testMethod === 'hook'}
              onChange={() => setTestMethod('hook')}
            />
            <span className="ml-2">Usar hook (useCitas)</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="testMethod"
              value="direct"
              checked={testMethod === 'direct'}
              onChange={() => setTestMethod('direct')}
            />
            <span className="ml-2">Inserción directa</span>
          </label>
        </div>
      </div>
      
      <button 
        onClick={runTest}
        disabled={isTesting}
        className="qoder-dark-button-primary mb-4"
      >
        {isTesting ? "Probando..." : "Ejecutar Prueba"}
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
      
      <div className="mt-4 text-sm text-qoder-dark-text-secondary">
        <p><strong>Información del contexto:</strong></p>
        <p>ID de Barbería: {idBarberia || "No disponible"}</p>
        <p>Barbero actual: {barbero?.nombre || "No disponible"}</p>
        <p>Sucursales disponibles: {sucursales?.length || 0}</p>
        {sucursales && sucursales.length > 0 && (
          <p>ID de primera sucursal: {sucursales[0]?.id}</p>
        )}
      </div>
    </div>
  );
}