"use client";

import { useState, useEffect } from "react";
import { useBarberos } from "@/hooks/useBarberos";
import { useCajaRecordsDirect } from "@/hooks/useCajaRecordsDirect";
import { formatCurrency } from "@/utils/formatters";
import { StatCard } from "@/components/StatCard";

interface CajaResumenCompactoProps {
  desde?: string;
  hasta?: string;
  barberoId?: string;
}

export function CajaResumenCompacto({ desde, hasta, barberoId }: CajaResumenCompactoProps) {
  // Convertir barberoId string a número para el hook, si es necesario
  const barberoIdNum = barberoId ? parseInt(barberoId, 10) : undefined;
  const { data, isLoading } = useCajaRecordsDirect({ desde, hasta, barberoId: barberoIdNum });
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberos();
  
  const [barberoName, setBarberoName] = useState<string>("");

  useEffect(() => {
    if (barberoId && barberos) {
      const barbero = barberos.find(b => b.id_barbero === barberoId);
      if (barbero) {
        setBarberoName(barbero.nombre);
      } else {
        setBarberoName(`ID: ${barberoId}`);
      }
    } else {
      setBarberoName("Todos los barberos");
    }
  }, [barberoId, barberos]);

  if (isLoading || isLoadingBarberos) {
    return (
      <div className="qoder-dark-card p-6">
        <p className="text-qoder-dark-text-primary">Cargando resumen de caja...</p>
      </div>
    );
  }

  // Calcular estadísticas
  const totalIngresos = data?.total || 0;
  const totalRegistros = data?.records?.length || 0;
  
  // Calcular ingresos por método de pago
  const ingresosPorMetodo = data?.records?.reduce((acc: Record<string, number>, record: any) => {
    const metodo = record.metodo_pago || "No especificado";
    acc[metodo] = (acc[metodo] || 0) + (record.monto || 0);
    return acc;
  }, {}) || {};

  return (
    <div className="qoder-dark-card">
      <div className="qoder-dark-window-header">
        <h3 className="font-semibold text-qoder-dark-text-primary">
          Resumen de Caja - {barberoName}
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Ingresos"
            value={formatCurrency(totalIngresos)}
            description="Monto total recaudado"
          />
          <StatCard
            title="Total Registros"
            value={totalRegistros.toString()}
            description="Movimientos registrados"
          />
          <StatCard
            title="Promedio por Registro"
            value={totalRegistros > 0 ? formatCurrency(totalIngresos / totalRegistros) : "$0.00"}
            description="Ingreso promedio por movimiento"
          />
        </div>
        
        {Object.keys(ingresosPorMetodo).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Ingresos por Método de Pago
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(ingresosPorMetodo).map(([metodo, monto]) => (
                <div 
                  key={metodo} 
                  className="bg-qoder-dark-bg-secondary p-2 rounded text-sm"
                >
                  <div className="flex justify-between">
                    <span className="text-qoder-dark-text-primary">{metodo}</span>
                    <span className="font-medium text-qoder-dark-text-primary">
                      {formatCurrency(Number(monto))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}