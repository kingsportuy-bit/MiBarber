"use client";

import { GraficaBarras } from "@/components/GraficaBarras";
import type { ChartData } from "@/features/dashboard/types";

interface BarChartProps {
  data: ChartData[];
  titulo: string;
  color?: string;
}

export function BarChart({ data, titulo, color }: BarChartProps) {
  return (
    <GraficaBarras 
      data={data.map(item => ({ nombre: item.nombre, valor: item.valor }))}
      titulo={titulo}
      color={color}
    />
  );
}