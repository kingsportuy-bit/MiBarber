"use client";

import { useMemo } from "react";
import { useEstadisticas } from "@/hooks/useEstadisticas";
import type { AdminEstadisticas } from "@/hooks/useEstadisticas";

interface TopClientesProps {
  filtros: {
    periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
    barberoId?: string;
    sucursalId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  };
}

interface CajaRecord {
  id_cliente?: string;
  monto: number;
}

interface Cliente {
  id_cliente: string;
  nombre: string;
}

export function TopClientes({ filtros }: TopClientesProps) {
  // Como no tenemos el hook avanzado, vamos a simular los datos necesarios
  const isLoading = false;
  const cajaRecords: CajaRecord[] = [];
  const clientes: Cliente[] = [];
  
  const top5Clientes = useMemo(() => {
    // Simulamos datos vacíos por ahora
    return [];
  }, [cajaRecords, clientes]);

  if (isLoading) {
    return (
      <div className="qoder-dark-card">
        <h3 className="font-semibold text-qoder-dark-text-primary mb-4">Top 5 Clientes por Facturación</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="h-4 bg-qoder-dark-bg-secondary rounded w-1/3"></div>
              <div className="h-4 bg-qoder-dark-bg-secondary rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">Top 5 Clientes por Facturación</h3>
      <div className="space-y-3">
        {top5Clientes.length > 0 ? (
          top5Clientes.map((cliente: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-qoder-dark-bg-secondary flex items-center justify-center mr-3">
                  <span className="text-qoder-dark-text-primary font-semibold">{index + 1}</span>
                </div>
                <div className="text-qoder-dark-text-primary">{cliente.nombre}</div>
              </div>
              <div className="text-qoder-dark-text-primary font-semibold">
                ${cliente.monto?.toFixed(2) || '0.00'}
              </div>
            </div>
          ))
        ) : (
          <div className="text-qoder-dark-text-secondary text-center py-4">
            No hay datos suficientes para mostrar el ranking
          </div>
        )}
      </div>
    </div>
  );
}