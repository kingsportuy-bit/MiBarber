"use client";

import { useMemo } from "react";
import type { CajaRecord } from "@/types/db";
import { formatCurrency } from "@/utils/formatters";
import { getLocalDateString } from "@/utils/dateUtils"; // Importar la utilidad de fecha

interface CajaStatsProps {
  records: CajaRecord[];
}

export function CajaStats({ records }: CajaStatsProps) {
  const stats = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        totalIngresos: 0,
        totalRegistros: 0,
        promedioPorRegistro: 0,
        registrosHoy: 0
      };
    }

    const totalIngresos = records.reduce((sum, record) => sum + record.monto, 0);
    const totalRegistros = records.length;
    const promedioPorRegistro = totalIngresos / totalRegistros;
    
    // Usar la utilidad de fecha corregida
    const hoy = getLocalDateString();
    const registrosHoy = records.filter(record => 
      record.fecha === hoy
    ).length;

    return {
      totalIngresos,
      totalRegistros,
      promedioPorRegistro,
      registrosHoy
    };
  }, [records]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="qoder-dark-card text-center hover-lift smooth-transition">
        <div className="text-2xl font-bold text-qoder-dark-text-primary">{stats.totalRegistros}</div>
        <div className="text-xs text-qoder-dark-text-secondary">Total Registros</div>
      </div>
      
      <div className="qoder-dark-card text-center hover-lift smooth-transition">
        <div className="text-2xl font-bold text-qoder-dark-text-primary">{formatCurrency(stats.totalIngresos)}</div>
        <div className="text-xs text-qoder-dark-text-secondary">Total Ingresos</div>
      </div>
      
      <div className="qoder-dark-card text-center hover-lift smooth-transition">
        <div className="text-2xl font-bold text-qoder-dark-text-primary">{formatCurrency(stats.promedioPorRegistro)}</div>
        <div className="text-xs text-qoder-dark-text-secondary">Promedio por Registro</div>
      </div>
      
      <div className="qoder-dark-card text-center hover-lift smooth-transition">
        <div className="text-2xl font-bold text-qoder-dark-text-primary">{stats.registrosHoy}</div>
        <div className="text-xs text-qoder-dark-text-secondary">Registros Hoy</div>
      </div>
    </div>
  );
}