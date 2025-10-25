"use client";

import { GraficaTorta } from "@/components/GraficaTorta";
import { useEstadisticasCompletas } from "@/hooks/useEstadisticasCompletas";
import type { EstadisticasFiltros } from "@/hooks/useEstadisticasCompletas";

interface GraficaDistribucionMetodosPagoProps {
  filtros: EstadisticasFiltros;
}

export function GraficaDistribucionMetodosPago({ filtros }: GraficaDistribucionMetodosPagoProps) {
  const { kpis, isLoading } = useEstadisticasCompletas(filtros);

  if (isLoading || !kpis) {
    return (
      <div className="qoder-dark-card h-64 animate-pulse bg-qoder-dark-bg-secondary" />
    );
  }

  // Colores predefinidos para los métodos de pago
  const colores = [
    "rgb(59 130 246)",    // blue-500
    "rgb(16 185 129)",    // emerald-500
    "rgb(245 158 11)",    // amber-500
    "rgb(139 92 246)",    // violet-500
    "rgb(236 72 153)",    // pink-500
    "rgb(34 197 94)",     // green-500
    "rgb(239 68 68)"      // red-500
  ];

  // Formatear datos para la gráfica
  const datosFormateados = Object.entries(kpis.serviciosPopulares || {}).map(([metodo, cantidad], index) => ({
    nombre: metodo,
    valor: cantidad,
    color: colores[index % colores.length]
  }));

  return (
    <GraficaTorta 
      data={datosFormateados} 
      titulo="Distribución de Servicios Populares" 
    />
  );
}