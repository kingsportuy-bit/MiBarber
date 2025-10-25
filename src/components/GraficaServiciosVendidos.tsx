"use client";

import { GraficaBarras } from "@/components/GraficaBarras";
import { useEstadisticasCompletas } from "@/hooks/useEstadisticasCompletas";
import type { EstadisticasFiltros } from "@/hooks/useEstadisticasCompletas";

interface GraficaServiciosVendidosProps {
  filtros: EstadisticasFiltros;
}

export function GraficaServiciosVendidos({ filtros }: GraficaServiciosVendidosProps) {
  const { kpis, isLoading } = useEstadisticasCompletas(filtros);

  if (isLoading || !kpis) {
    return (
      <div className="qoder-dark-card h-64 animate-pulse bg-qoder-dark-bg-secondary" />
    );
  }

  // Tomar los servicios populares y formatear datos para la gráfica
  const datosFormateados = Object.entries(kpis.serviciosPopulares || {})
    .map(([servicio, cantidad]) => ({
      nombre: servicio,
      valor: cantidad
    }))
    .slice(0, 10);

  return (
    <GraficaBarras 
      data={datosFormateados} 
      titulo="Servicios Populares" 
      color="bg-qoder-dark-accent-secondary"
    />
  );
}