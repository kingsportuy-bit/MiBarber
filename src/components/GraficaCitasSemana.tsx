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
      // Parsear la fecha manualmente para evitar problemas de zona horaria
      const [year, month, day] = cita.fecha.split("-").map(Number);
      // Crear una fecha en la zona horaria local (ajustando a mediodía para evitar problemas de DST)
      const date = new Date(year, month - 1, day, 12, 0, 0);
      const diaSemana = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
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
              stroke="#888888"
            />
            <YAxis 
              stroke="#888888"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                borderColor: '#3c3c3c',
                borderRadius: '0.5rem'
              }}
            />
            <Bar 
              dataKey="citas" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
