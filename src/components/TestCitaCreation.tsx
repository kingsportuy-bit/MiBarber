"use client";

import { useState } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { getLocalDateString } from "@/utils/dateUtils";

export function TestCitaCreation() {
  const { idBarberia, barbero } = useBarberoAuth();
  const { sucursales } = useSucursales(idBarberia || undefined);
  const { createMutation } = useCitas();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const handleTestCreate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Crear una cita de prueba con datos mínimos
      const testData = {
        fecha: getLocalDateString(),
        hora: "10:00",
        cliente_nombre: "Cliente de Prueba",
        servicio: "Corte de Cabello",
        barbero: barbero?.nombre || "Barbero de Prueba",
        id_sucursal: sucursales && sucursales.length > 0 ? sucursales[0]?.id : "00000000-0000-0000-0000-000000000000",
        id_barberia: idBarberia || "00000000-0000-0000-0000-000000000000",
        estado: "pendiente",
        creado: new Date().toISOString(),
        duracion: "30m"
      };
      
      console.log("Datos de prueba a enviar:", testData);
      
      const result = await createMutation.mutateAsync(testData);
      setResult(result);
      console.log("Cita creada exitosamente:", result);
    } catch (err) {
      setError(err);
      console.error("Error al crear cita de prueba:", err);
      console.error("Tipo de error:", typeof err);
      console.error("Error detallado:", JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-qoder-dark-bg-form rounded-lg">
      <h3 className="text-lg font-bold text-qoder-dark-text-primary mb-4">Prueba de Creación de Cita</h3>
      
      <button 
        onClick={handleTestCreate}
        disabled={isLoading}
        className="qoder-dark-button-primary mb-4"
      >
        {isLoading ? "Creando..." : "Crear Cita de Prueba"}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-green-900 rounded">
          <h4 className="font-bold text-green-300">Éxito:</h4>
          <pre className="text-green-100 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-900 rounded">
          <h4 className="font-bold text-red-300">Error:</h4>
          <pre className="text-red-100 text-sm overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-qoder-dark-text-secondary">
        <p>ID de Barbería: {idBarberia || "No disponible"}</p>
        <p>Sucursales disponibles: {sucursales?.length || 0}</p>
        {sucursales && sucursales.length > 0 && (
          <p>ID de primera sucursal: {sucursales[0]?.id}</p>
        )}
      </div>
    </div>
  );
}