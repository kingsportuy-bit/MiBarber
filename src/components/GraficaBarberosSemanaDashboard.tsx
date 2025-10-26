"use client";

import type { Appointment } from "@/types/db";
import { GraficaBarras } from "@/components/GraficaBarras";

interface GraficaBarberosSemanaDashboardProps {
  citas: Appointment[];
}

export function GraficaBarberosSemanaDashboard({ citas }: GraficaBarberosSemanaDashboardProps) {
  // Contar citas por barbero
  const citasPorBarbero: Record<string, number> = {};
  
  citas.forEach(cita => {
    const barbero = cita.barbero || "Sin asignar";
    citasPorBarbero[barbero] = (citasPorBarbero[barbero] || 0) + 1;
  });
  
  // Convertir a array y ordenar por cantidad
  const datosFormateados = Object.entries(citasPorBarbero)
    .map(([barbero, cantidad]) => ({
      nombre: barbero,
      valor: cantidad
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5); // Top 5 barberos

  return (
    <GraficaBarras 
      data={datosFormateados} 
      titulo="Ranking de Barberos (Semana)" 
      color="bg-qoder-dark-accent-secondary"
    />
  );
}