"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/utils/formatters";
import type { Appointment, CajaRecord } from "@/types/db";

interface DashboardKPIsProps {
  citasHoy: Appointment[];
  ingresosHoy: CajaRecord[];
}

export function DashboardKPIs({ citasHoy, ingresosHoy }: DashboardKPIsProps) {
  const kpis = useMemo(() => {
    // Citas de hoy (cantidad total)
    const totalCitasHoy = citasHoy.length;
    
    // Ingresos estimados de hoy (según servicios asociados a las citas)
    let ingresosEstimados = 0;
    citasHoy.forEach(cita => {
      if (cita.ticket != null) {
        ingresosEstimados += cita.ticket;
      }
    });
    
    // Ingresos reales de hoy (según movimientos en caja)
    let ingresosReales = 0;
    ingresosHoy.forEach(record => {
      ingresosReales += record.monto;
    });
    
    return {
      totalCitasHoy,
      ingresosEstimados,
      ingresosReales
    };
  }, [citasHoy, ingresosHoy]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="qoder-dark-card">
        <div className="text-sm text-qoder-dark-text-secondary">Citas de hoy</div>
        <div className="text-3xl font-bold text-qoder-dark-text-primary">{kpis.totalCitasHoy}</div>
      </div>
      
      <div className="qoder-dark-card">
        <div className="text-sm text-qoder-dark-text-secondary">Ingresos estimados</div>
        <div className="text-3xl font-bold text-qoder-dark-text-primary">{formatCurrency(kpis.ingresosEstimados)}</div>
      </div>
      
      <div className="qoder-dark-card">
        <div className="text-sm text-qoder-dark-text-secondary">Ingresos reales</div>
        <div className="text-3xl font-bold text-qoder-dark-text-primary">{formatCurrency(kpis.ingresosReales)}</div>
      </div>
    </div>
  );
}