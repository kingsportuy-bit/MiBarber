"use client";

import { GraficaTorta } from "@/components/GraficaTorta";
import type { PieChartData } from "@/features/dashboard/types";

interface PieChartProps {
  data: PieChartData[];
  titulo: string;
}

export function PieChart({ data, titulo }: PieChartProps) {
  return (
    <GraficaTorta 
      data={data.map(item => ({ nombre: item.nombre, valor: item.valor, color: item.color }))}
      titulo={titulo}
    />
  );
}