"use client";

import { useMemo } from "react";
import { useEstadisticasAvanzadas } from "@/hooks/useEstadisticasAvanzadas";
import type { EstadisticasFiltros } from "@/hooks/useEstadisticasAvanzadas";

interface TopClientesProps {
  filtros: EstadisticasFiltros;
}

export function TopClientes({ filtros }: TopClientesProps) {
  const { citas, cajaRecords, clientes, isLoading } = useEstadisticasAvanzadas(filtros);

  const top5Clientes = useMemo(() => {
    // Calcular gasto por cliente
    const gastoPorCliente: Record<string, number> = {};
    cajaRecords.forEach(record => {
      if (record.id_cliente) {
        gastoPorCliente[record.id_cliente] = (gastoPorCliente[record.id_cliente] || 0) + record.monto;
      }
    });
    
    // Obtener top 5 clientes
    return Object.entries(gastoPorCliente)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([id, monto]) => {
        const cliente = clientes.find(c => c.id_cliente === id);
        return {
          id,
          nombre: cliente ? cliente.nombre : id,
          monto
        };
      });
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
        {top5Clientes.map((cliente, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-qoder-dark-bg-secondary flex items-center justify-center mr-3">
                <span className="text-qoder-dark-text-primary font-semibold">{index + 1}</span>
              </div>
              <div className="text-qoder-dark-text-primary">{cliente.nombre}</div>
            </div>
            <div className="text-qoder-dark-text-primary font-semibold">
              ${cliente.monto.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}