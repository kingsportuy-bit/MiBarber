"use client";

import { useState } from "react";
import { StatCard } from "@/components/StatCard";

interface CompararPeriodosProps {
  datosActuales: any;
  datosAnteriores: any;
  metricas: { key: string; label: string; format: (value: number) => string }[];
}

export function CompararPeriodos({ datosActuales, datosAnteriores, metricas }: CompararPeriodosProps) {
  // Calcular porcentajes de cambio
  const calcularCambios = () => {
    return metricas.map(metrica => {
      const actual = datosActuales[metrica.key] || 0;
      const anterior = datosAnteriores[metrica.key] || 0;
      
      let cambioPorcentaje = 0;
      let cambioValor = 0;
      
      if (anterior !== 0) {
        cambioPorcentaje = ((actual - anterior) / anterior) * 100;
        cambioValor = actual - anterior;
      } else if (actual > 0) {
        cambioPorcentaje = 100;
        cambioValor = actual;
      }
      
      return {
        ...metrica,
        actual,
        anterior,
        cambioPorcentaje,
        cambioValor
      };
    });
  };
  
  const cambios = calcularCambios();

  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">
        Comparación de Períodos
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cambios.map((metrica, index) => {
          const trend = metrica.cambioPorcentaje > 0 ? 'up' : metrica.cambioPorcentaje < 0 ? 'down' : undefined;
          const trendValue = metrica.cambioPorcentaje !== 0 
            ? `${metrica.cambioPorcentaje > 0 ? '+' : ''}${metrica.cambioPorcentaje.toFixed(1)}%` 
            : '';
          
          return (
            <StatCard
              key={index}
              title={metrica.label}
              value={metrica.format(metrica.actual)}
              description={`Anterior: ${metrica.format(metrica.anterior)}`}
              trend={trend}
              trendValue={trendValue}
            />
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-qoder-dark-border-primary">
        <h4 className="text-sm font-medium text-qoder-dark-text-primary mb-2">
          Análisis
        </h4>
        <div className="text-sm text-qoder-dark-text-secondary space-y-1">
          {cambios.map((metrica, index) => {
            if (metrica.cambioPorcentaje === 0) return null;
            
            const direccion = metrica.cambioPorcentaje > 0 ? 'aumentó' : 'disminuyó';
            const magnitud = Math.abs(metrica.cambioPorcentaje);
            
            let descripcion = "";
            if (magnitud > 20) {
              descripcion = "cambio significativo";
            } else if (magnitud > 10) {
              descripcion = "cambio notable";
            } else if (magnitud > 5) {
              descripcion = "cambio moderado";
            } else {
              descripcion = "cambio leve";
            }
            
            return (
              <p key={index}>
                <span className="font-medium">{metrica.label}</span> {direccion} en {magnitud.toFixed(1)}% ({descripcion})
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}