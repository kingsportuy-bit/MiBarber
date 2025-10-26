"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import type { Appointment } from "@/types/db";

interface GraficaCitasSemanaProps {
  citas: Appointment[];
}

export function GraficaCitasSemana({ citas }: GraficaCitasSemanaProps) {
  const chartData = useMemo(() => {
    // Inicializar datos para cada día de la semana
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const citasPorDia = Array(7).fill(0);
    
    // Contar citas por día de la semana
    citas.forEach(cita => {
      const fecha = new Date(cita.fecha);
      const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
      // Ajustar para que 0 = Lunes, 6 = Domingo
      const indice = diaSemana === 0 ? 6 : diaSemana - 1;
      citasPorDia[indice]++;
    });
    
    // Convertir a formato para la gráfica
    return diasSemana.map((dia, index) => ({
      dia,
      citas: citasPorDia[index]
    }));
  }, [citas]);

  return (
    <div className="qoder-dark-card p-4">
      <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Citas de la semana</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
            <XAxis 
              dataKey="dia" 
              tick={{ fill: '#b0b0b0', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#b0b0b0', fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [value, 'Citas']}
              labelFormatter={(value) => `Día: ${value}`}
              contentStyle={{ 
                backgroundColor: '#252525', 
                border: '1px solid #3c3c3c', 
                borderRadius: '8px',
                color: '#f1f1f1'
              }}
            />
            <Bar 
              dataKey="citas" 
              fill="#60a5fa" 
              name="Citas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}