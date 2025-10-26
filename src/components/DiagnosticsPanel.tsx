"use client";

import { useState, useEffect } from "react";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function DiagnosticsPanel() {
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const { sucursales, isLoading: isLoadingSucursales } = useSucursales(idBarberia || undefined);
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberosList(idBarberia || undefined);
  const firstSucursalId = sucursales?.[0]?.id;
  const { data: servicios, isLoading: isLoadingServicios } = useServiciosListPorSucursal(firstSucursalId);
  
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnosticResult(null);
    
    try {
      const supabase = getSupabaseClient();
      
      // 1. Verificar conexión y permisos
      const connectionTest = await supabase.from('mibarber_barberias').select('id').limit(1);
      
      // 2. Verificar estructura de la tabla de citas
      const { data: columns, error: columnsError } = await supabase
        .from('mibarber_citas')
        .select('*')
        .limit(0);
      
      // 3. Intentar insertar un registro de prueba
      const testData = {
        fecha: new Date().toISOString().split('T')[0],
        hora: "10:00:00",
        cliente_nombre: "Diagnóstico",
        servicio: "Prueba",
        barbero: barbero?.nombre || "Test Barbero",
        id_sucursal: firstSucursalId || null,
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
      
      console.log("Datos de prueba:", testData);
      
      const insertTest = await (supabase as any)
        .from('mibarber_citas')
        .insert([testData])
        .select()
        .single();
      
      // 4. Verificar datos relacionados
      const relatedData = {
        barberias: await supabase.from('mibarber_barberias').select('id').limit(5),
        sucursales: await supabase.from('mibarber_sucursales').select('id').limit(5),
        barberos: await supabase.from('mibarber_barberos').select('id').limit(5),
        servicios: await supabase.from('mibarber_servicios').select('id').limit(5)
      };
      
      setDiagnosticResult({
        connectionTest,
        tableStructure: columns,
        tableStructureError: columnsError,
        insertTest,
        relatedData
      });
    } catch (error) {
      console.error("Error en diagnóstico:", error);
      setDiagnosticResult({ error });
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="p-4 bg-qoder-dark-bg-form rounded-lg">
      <h3 className="text-lg font-bold text-qoder-dark-text-primary mb-4">Panel de Diagnóstico</h3>
      
      <button 
        onClick={runDiagnostics}
        disabled={isRunning}
        className="qoder-dark-button-primary mb-4"
      >
        {isRunning ? "Ejecutando diagnóstico..." : "Ejecutar Diagnóstico"}
      </button>
      
      {diagnosticResult && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <h4 className="font-bold text-gray-200 mb-2">Resultados:</h4>
          <pre className="text-gray-100 text-sm overflow-auto max-h-96">
            {JSON.stringify(diagnosticResult, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-qoder-dark-text-secondary">
        <p>ID de Barbería: {idBarberia || "No disponible"}</p>
        <p>Es administrador: {isAdmin ? "Sí" : "No"}</p>
        <p>Barbero actual: {barbero?.nombre || "No disponible"}</p>
        <p>Sucursales: {sucursales?.length || 0}</p>
        <p>Barberos: {barberos?.length || 0}</p>
        <p>Servicios: {servicios?.length || 0}</p>
      </div>
    </div>
  );
}