"use client";

import { GraficaLineas } from "@/components/GraficaLineas";
import { useEstadisticasCompletas } from "@/hooks/useEstadisticasCompletas";
import type { EstadisticasFiltros } from "@/hooks/useEstadisticasCompletas";

interface GraficaIngresosDiariosProps {
  filtros: EstadisticasFiltros;
}

export function GraficaIngresosDiarios({ filtros }: GraficaIngresosDiariosProps) {
  const { kpis, isLoading } = useEstadisticasCompletas(filtros);

  if (isLoading || !kpis) {
    return (
      <div className="qoder-dark-card h-64 animate-pulse bg-qoder-dark-bg-secondary" />
    );
  }

  // Formatear datos para la gráfica (usando ingresosTotales como ejemplo)
  const datosFormateados = [{
    fecha: "Total",
    valor: kpis.ingresosTotales || 0
  }];

  return (
    <GraficaLineas 
      data={datosFormateados} 
      titulo="Ingresos Totales" 
      color="text-qoder-dark-accent-primary"
    />
  );
}