"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from "recharts";

interface RankingBarberosProps {
  datos: Array<{ barbero: string; citas: number }> | null;
}

// Colores para las gráficas
const BAR_COLORS = ["#fbbf24", "#60a5fa", "#34d399", "#f87171", "#a78bfa", "#f472b6"];
const PIE_COLORS = ["#fbbf24", "#60a5fa", "#34d399", "#f87171", "#a78bfa", "#f472b6"];

export function RankingBarberos({ datos }: RankingBarberosProps) {
  const chartData = useMemo(() => {
    if (!datos) return [];
    
    // Agrupar y sumar citas por barbero
    const barberoStats: Record<string, { citas: number }> = {};
    
    datos.forEach(item => {
      if (!barberoStats[item.barbero]) {
        barberoStats[item.barbero] = {
          citas: 0
        };
      }
      barberoStats[item.barbero].citas += item.citas || 0;
    });
    
    // Convertir a array y ordenar por citas
    return Object.entries(barberoStats)
      .map(([barberoId, stats]) => ({
        barbero: barberoId,
        citas: stats.citas
      }))
      .sort((a, b) => b.citas - a.citas);
  }, [datos]);

  if (!datos || datos.length === 0) {
    return (
      <div className="qoder-dark-card p-6 text-center">
        <p className="text-qoder-dark-text-secondary">No hay datos de barberos disponibles</p>
      </div>
    );
  }

  // Preparar datos para la gráfica de torta (participación en citas)
  const pieData = chartData.map((item, index) => ({
    name: item.barbero,
    value: item.citas,
    color: PIE_COLORS[index % PIE_COLORS.length]
  }));

  return (
    <div className="qoder-dark-card p-6">
      <h3 className="text-xl font-bold text-qoder-dark-text-primary mb-6">Ranking de Barberos</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfica de barras - Citas por barbero */}
        <div className="bg-qoder-dark-bg-secondary rounded-xl p-4">
          <h4 className="text-lg font-semibold text-qoder-dark-text-primary mb-4 text-center">Citas Atendidas</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 130, bottom: 5 }}
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
                  width={120}
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value)}`, 'Citas']}
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
                  name="Citas"
                  radius={[0, 4, 4, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BAR_COLORS[index % BAR_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfica de torta - Participación en citas */}
        <div className="bg-qoder-dark-bg-secondary rounded-xl p-4">
          <h4 className="text-lg font-semibold text-qoder-dark-text-primary mb-4 text-center">Participación en Citas</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent as number * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${Number(value)}`, 'Citas']}
                  contentStyle={{ 
                    backgroundColor: '#252525', 
                    border: '1px solid #3c3c3c', 
                    borderRadius: '8px',
                    color: '#f1f1f1'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Tabla de detalles */}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-qoder-dark-bg-tertiary">
            <tr>
              <th className="px-4 py-3 text-left text-qoder-dark-text-primary font-semibold rounded-tl-lg">Barbero</th>
              <th className="px-4 py-3 text-left text-qoder-dark-text-primary font-semibold rounded-tr-lg">Citas Atendidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-qoder-dark-border-primary">
            {chartData.map((item, index) => (
              <tr 
                key={index} 
                className={`${
                  index % 2 === 0 ? 'bg-qoder-dark-bg-secondary' : 'bg-qoder-dark-bg-primary'
                } hover:bg-qoder-dark-bg-hover transition-all duration-200`}
              >
                <td className="px-4 py-3 font-medium text-qoder-dark-text-primary">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                    ></div>
                    {item.barbero}
                  </div>
                </td>
                <td className="px-4 py-3 text-qoder-dark-text-primary font-semibold">
                  {item.citas}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}