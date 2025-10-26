"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import type { Appointment } from "@/types/db";

interface GraficaBarberosSemanaProps {
  citas: Appointment[];
}

export function GraficaBarberosSemana({ citas }: GraficaBarberosSemanaProps) {
  const chartData = useMemo(() => {
    // Contar citas por barbero
    const citasPorBarbero: Record<string, number> = {};
    
    citas.forEach(cita => {
      citasPorBarbero[cita.barbero] = (citasPorBarbero[cita.barbero] || 0) + 1;
    });
    
    // Convertir a array y ordenar por cantidad de citas
    return Object.entries(citasPorBarbero)
      .map(([barbero, cantidad]) => ({
        barbero,
        citas: cantidad
      }))
      .sort((a, b) => b.citas - a.citas);
  }, [citas]);

  return (
    <div className="qoder-dark-card p-4">
      <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Ranking de barberos de la semana</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              tick={{ fill: '#b0b0b0', fontSize: 12 }}
            />
            <YAxis 
              dataKey="barbero" 
              type="category" 
              tick={{ fill: '#b0b0b0', fontSize: 12 }}
              width={90}
            />
            <Tooltip 
              formatter={(value) => [value, 'Citas']}
              labelFormatter={(value) => `Barbero: ${value}`}
              contentStyle={{ 
                backgroundColor: '#252525', 
                border: '1px solid #3c3c3c', 
                borderRadius: '8px',
                color: '#f1f1f1'
              }}
            />
            <Bar 
              dataKey="citas" 
              fill="#fbbf24" 
              name="Citas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}