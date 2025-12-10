"use client";

import { useMemo } from "react";
import { useEstadisticasClientes } from "@/hooks/useEstadisticas";
import type { FiltrosEstadisticas } from "@/types/estadisticas";

interface TopClientesProps {
  filtros: {
    periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
    barberoId?: string;
    sucursalId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  };
}

export function TopClientes({ filtros }: TopClientesProps) {
  // Convertir los filtros al formato esperado por useEstadisticasClientes
  const filtrosEstadisticas: FiltrosEstadisticas = {
    sucursalId: filtros.sucursalId,
    barberoId: filtros.barberoId,
    fechaInicio: filtros.fechaDesde,
    fechaFin: filtros.fechaHasta
  };

  const { data: clientesStats, isLoading, error } = useEstadisticasClientes(filtrosEstadisticas);
  
  // Extraer los clientes frecuentes de las estadísticas
  const top5Clientes = useMemo(() => {
    if (!clientesStats?.clientes_frecuentes) return [];
    
    // Los clientes frecuentes ya están ordenados por visitas, tomar los top 5
    return clientesStats.clientes_frecuentes.slice(0, 5);
  }, [clientesStats]);

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

  if (error) {
    return (
      <div className="qoder-dark-card">
        <h3 className="font-semibold text-qoder-dark-text-primary mb-4">Top 5 Clientes por Facturación</h3>
        <div className="text-qoder-dark-text-secondary text-center py-4">
          Error al cargar los datos: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">Top 5 Clientes por Visitas</h3>
      <div className="space-y-3">
        {top5Clientes.length > 0 ? (
          top5Clientes.map((cliente, index) => (
            <div key={cliente.id_cliente} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-qoder-dark-bg-secondary flex items-center justify-center mr-3">
                  <span className="text-qoder-dark-text-primary font-semibold">{index + 1}</span>
                </div>
                <div className="text-qoder-dark-text-primary">{cliente.nombre_cliente}</div>
              </div>
              <div className="text-qoder-dark-text-primary font-semibold">
                {cliente.total_visitas} visitas
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