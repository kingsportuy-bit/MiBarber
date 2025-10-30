"use client";

import { GraficaLineas } from "@/components/GraficaLineas";
import type { LineChartData } from "@/features/dashboard/types";

interface LineChartProps {
  data: LineChartData[];
  titulo: string;
  color?: string;
}

export function LineChart({ data, titulo, color }: LineChartProps) {
  return (
    <GraficaLineas 
      data={data.map(item => ({ fecha: item.fecha, valor: item.valor }))}
      titulo={titulo}
      color={color}
    />
  );
}