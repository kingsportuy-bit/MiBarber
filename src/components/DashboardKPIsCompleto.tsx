"use client";

import { StatCard } from "@/components/StatCard";
import type { Appointment, CajaRecord } from "@/types/db";

interface DashboardKPIsCompletoProps {
  citasHoy: Appointment[];
  ingresosHoy: CajaRecord[];
  ingresosRealesHoy: number;
}

export function DashboardKPIsCompleto({ citasHoy, ingresosHoy, ingresosRealesHoy }: DashboardKPIsCompletoProps) {
  // Calcular ingresos estimados de hoy (basados en servicios asociados a las citas)
  const ingresosEstimados = citasHoy.reduce((sum, cita) => {
    // En una implementación real, aquí se buscaría el precio del servicio
    // Por ahora usamos un valor estimado
    return sum + 20; // Valor promedio estimado por cita
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Citas de Hoy"
        value={citasHoy.length.toString()}
        description="Total de citas programadas"
        trend={citasHoy.length > 5 ? 'up' : 'down'}
        trendValue={citasHoy.length > 5 ? "+ Alta demanda" : "- Baja demanda"}
      />
      
      <StatCard
        title="Ingresos Estimados"
        value={`$${ingresosEstimados.toFixed(2)}`}
        description="Basado en servicios programados"
        trend={ingresosEstimados > 100 ? 'up' : 'down'}
        trendValue={ingresosEstimados > 100 ? "+ Buen rendimiento" : "- Rendimiento bajo"}
      />
      
      <StatCard
        title="Ingresos Reales"
        value={`$${ingresosRealesHoy.toFixed(2)}`}
        description="Movimientos en caja hoy"
        trend={ingresosRealesHoy > ingresosEstimados ? 'up' : 'down'}
        trendValue={ingresosRealesHoy > ingresosEstimados ? "+ Superó estimaciones" : "- Por debajo estim."}
      />
    </div>
  );
}