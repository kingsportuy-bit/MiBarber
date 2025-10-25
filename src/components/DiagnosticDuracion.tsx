"use client";

import { useEffect, useState } from "react";
import { useCitas } from "@/hooks/useCitas";

export function DiagnosticDuracion() {
  const { data: citas, isLoading, error } = useCitas();
  const [diagnostico, setDiagnostico] = useState<any>(null);

  useEffect(() => {
    if (citas && citas.length > 0) {
      // Analizar las duraciones
      const duraciones = citas.map(cita => ({
        id: cita.id_cita,
        duracion: cita.duracion,
        tipo: typeof cita.duracion,
        formato: cita.duracion ? cita.duracion.toString().trim() : 'null'
      }));

      // Contar valores únicos
      const valoresUnicos: Record<string, number> = {};
      duraciones.forEach(d => {
        const key = d.formato || 'null';
        valoresUnicos[key] = (valoresUnicos[key] || 0) + 1;
      });

      // Encontrar citas sin duración
      const sinDuracion = citas.filter(c => !c.duracion || c.duracion === '');

      setDiagnostico({
        totalCitas: citas.length,
        conDuracion: duraciones.filter(d => d.formato !== 'null').length,
        sinDuracion: sinDuracion.length,
        valoresUnicos,
        muestra: duraciones.slice(0, 10) // Mostrar solo las primeras 10
      });
    }
  }, [citas]);

  if (isLoading) return <div>Cargando diagnóstico...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!diagnostico) return <div>No hay datos para analizar</div>;

  return (
    <div className="qoder-dark-card p-4 mt-4">
      <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-3">Diagnóstico de Duración</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-qoder-dark-bg-secondary p-3 rounded">
          <div className="text-sm text-qoder-dark-text-secondary">Total Citas</div>
          <div className="text-2xl font-bold text-qoder-dark-text-primary">{diagnostico.totalCitas}</div>
        </div>
        
        <div className="bg-qoder-dark-bg-secondary p-3 rounded">
          <div className="text-sm text-qoder-dark-text-secondary">Con Duración</div>
          <div className="text-2xl font-bold text-qoder-dark-text-primary">{diagnostico.conDuracion}</div>
        </div>
        
        <div className="bg-qoder-dark-bg-secondary p-3 rounded">
          <div className="text-sm text-qoder-dark-text-secondary">Sin Duración</div>
          <div className="text-2xl font-bold text-qoder-dark-text-primary">{diagnostico.sinDuracion}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium text-qoder-dark-text-primary mb-2">Valores Únicos de Duración:</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(diagnostico.valoresUnicos).map(([valor, count]) => (
            <div key={valor} className="bg-qoder-dark-bg-tertiary px-3 py-1 rounded text-sm">
              "{valor}" ({count as number})
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-qoder-dark-text-primary mb-2">Muestra de Datos:</h4>
        <div className="text-xs bg-qoder-dark-bg-secondary p-3 rounded font-mono overflow-x-auto">
          {diagnostico.muestra.map((d: any, i: number) => (
            <div key={i} className="mb-1 last:mb-0">
              ID: {d.id?.substring(0, 8)}... | Duración: "{d.formato}" | Tipo: {d.tipo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}