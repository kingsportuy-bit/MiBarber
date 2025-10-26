"use client";

import { GraficaLineas } from "@/components/GraficaLineas";
import { useEstadisticasCompletas } from "@/hooks/useEstadisticasCompletas";
import type { EstadisticasFiltros } from "@/hooks/useEstadisticasCompletas";

interface GraficaEvolucionClientesProps {
  filtros: EstadisticasFiltros;
}

export function GraficaEvolucionClientes({ filtros }: GraficaEvolucionClientesProps) {
  const { kpis, isLoading } = useEstadisticasCompletas(filtros);

  if (isLoading || !kpis) {
    return (
      <div className="qoder-dark-card h-64 animate-pulse bg-qoder-dark-bg-secondary" />
    );
  }

  // Formatear datos para la gráfica (usando citasPorDia como ejemplo)
  const datosFormateados = Object.entries(kpis.citasPorDia || {}).map(([dia, cantidad]) => ({
    fecha: dia,
    valor: cantidad
  }));

  return (
    <GraficaLineas 
      data={datosFormateados} 
      titulo="Citas por Día de la Semana" 
      color="text-qoder-dark-accent-warning"
    />
  );
}