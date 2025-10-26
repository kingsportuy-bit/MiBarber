"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

// Definir la interfaz para las estadísticas
interface EstadisticasCompletas {
  totalCitas: number;
  totalClientes: number;
  ticketPromedio: number;
  serviciosPopulares: Record<string, number>;
  clientesFrecuentes: Record<string, number>;
  ingresosTotales: number;
  citasPorDia: Record<string, number>;
  horasPico: Record<string, number>;
}

interface ResumenEjecutivoProps {
  estadisticas: EstadisticasCompletas | null;
}

// Colores para las gráficas
const COLORS = ["#fbbf24", "#60a5fa", "#34d399", "#f87171", "#a78bfa", "#f472b6"];

export function ResumenEjecutivo({ estadisticas }: ResumenEjecutivoProps) {
  const ingresosPorDia = useMemo(() => {
    if (!estadisticas) return [];
    
    // Convertir citasPorDia a formato para la gráfica
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const ingresosPorDiaSemana: Record<string, number> = {};
    
    // Usar citasPorDia en lugar de ingresosDiarios
    Object.entries(estadisticas.citasPorDia || {}).forEach(([dia, count]: [string, number]) => {
      ingresosPorDiaSemana[dia] = count;
    });
    
    return Object.entries(ingresosPorDiaSemana)
      .map(([dia, count]: [string, number]) => ({ dia, count }))
      .sort((a: { dia: string; count: number }, b: { dia: string; count: number }) => diasSemana.indexOf(a.dia) - diasSemana.indexOf(b.dia));
  }, [estadisticas]);
  
  const serviciosData = useMemo(() => {
    if (!estadisticas) return [];
    
    // Convertir serviciosPopulares a formato para la gráfica
    return Object.entries(estadisticas.serviciosPopulares || {})
      .map(([servicio, cantidad]: [string, number]) => ({ servicio, cantidad }))
      .sort((a: { servicio: string; cantidad: number }, b: { servicio: string; cantidad: number }) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [estadisticas]);
  
  if (!estadisticas) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="qoder-dark-card h-80 animate-pulse bg-qoder-dark-bg-secondary" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Citas por día de la semana */}
      <div className="qoder-dark-card p-4">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Citas por día de la semana</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ingresosPorDia}
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
                formatter={(value: number) => [value, 'Citas']}
                labelFormatter={(value: string) => `Día: ${value}`}
                contentStyle={{ 
                  backgroundColor: '#252525', 
                  border: '1px solid #3c3c3c', 
                  borderRadius: '8px',
                  color: '#f1f1f1'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#fbbf24" 
                name="Citas"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Servicios más populares */}
      <div className="qoder-dark-card p-4">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Top 5 servicios más populares</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={serviciosData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(props: any) => {
                  const { servicio, cantidad } = props;
                  return `${servicio}: ${cantidad}`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
                nameKey="servicio"
              >
                {serviciosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value, 'Cantidad']}
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
  );
}