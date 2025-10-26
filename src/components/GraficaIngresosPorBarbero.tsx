"use client";

import { GraficaBarras } from "@/components/GraficaBarras";
import { useEstadisticasCompletas } from "@/hooks/useEstadisticasCompletas";
import type { EstadisticasFiltros } from "@/hooks/useEstadisticasCompletas";

interface GraficaIngresosPorBarberoProps {
  filtros: EstadisticasFiltros;
}

export function GraficaIngresosPorBarbero({ filtros }: GraficaIngresosPorBarberoProps) {
  const { kpis, isLoading } = useEstadisticasCompletas(filtros);

  if (isLoading || !kpis) {
    return (
      <div className="qoder-dark-card h-64 animate-pulse bg-qoder-dark-bg-secondary" />
    );
  }

  // Formatear datos para la gráfica (usando serviciosPopulares como ejemplo)
  const datosFormateados = Object.entries(kpis.serviciosPopulares || {}).map(([nombre, valor]) => ({
    nombre,
    valor
  }));

  return (
    <GraficaBarras 
      data={datosFormateados} 
      titulo="Servicios Populares" 
      color="bg-qoder-dark-accent-success"
    />
  );
}