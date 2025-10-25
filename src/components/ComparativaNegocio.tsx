"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, LineChart, Line, 
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

interface ComparativaNegocioProps {
  estadisticas: EstadisticasCompletas | null;
}

// Colores para las gráficas
const COLORS = ["#fbbf24", "#60a5fa", "#34d399", "#f87171", "#a78bfa", "#f472b6"];

export function ComparativaNegocio({ estadisticas }: ComparativaNegocioProps) {
  const datosServicios = useMemo(() => {
    if (!estadisticas) return [];
    
    // Convertir serviciosPopulares a formato para la gráfica
    return Object.entries(estadisticas.serviciosPopulares || {})
      .map(([servicio, cantidad]: [string, number]) => ({ servicio, cantidad }))
      .sort((a: { servicio: string; cantidad: number }, b: { servicio: string; cantidad: number }) => b.cantidad - a.cantidad)
      .slice(0, 8);
  }, [estadisticas]);

  const datosHorasPico = useMemo(() => {
    if (!estadisticas) return [];
    
    // Convertir horasPico a formato para la gráfica
    return Object.entries(estadisticas.horasPico || {})
      .map(([hora, cantidad]: [string, number]) => ({ hora: `${hora}:00`, cantidad }))
      .sort((a: { hora: string; cantidad: number }, b: { hora: string; cantidad: number }) => {
        const hourA = parseInt(a.hora.split(':')[0]);
        const hourB = parseInt(b.hora.split(':')[0]);
        return hourA - hourB;
      });
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
      {/* Servicios más populares */}
      <div className="qoder-dark-card p-4">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Servicios más populares</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosServicios}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
              <XAxis 
                dataKey="servicio" 
                tick={{ fill: '#b0b0b0', fontSize: 10 }}
                tickFormatter={(value: string) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
              />
              <YAxis 
                tick={{ fill: '#b0b0b0', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Cantidad']}
                labelFormatter={(value: string) => `Servicio: ${value}`}
                contentStyle={{ 
                  backgroundColor: '#252525', 
                  border: '1px solid #3c3c3c', 
                  borderRadius: '8px',
                  color: '#f1f1f1'
                }}
              />
              <Bar 
                dataKey="cantidad" 
                fill="#34d399" 
                name="Cantidad"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Horas pico */}
      <div className="qoder-dark-card p-4">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Horas pico</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={datosHorasPico}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
              <XAxis 
                dataKey="hora" 
                tick={{ fill: '#b0b0b0', fontSize: 10 }}
              />
              <YAxis 
                tick={{ fill: '#b0b0b0', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Citas']}
                labelFormatter={(value: string) => `Hora: ${value}`}
                contentStyle={{ 
                  backgroundColor: '#252525', 
                  border: '1px solid #3c3c3c', 
                  borderRadius: '8px',
                  color: '#f1f1f1'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cantidad" 
                stroke="#fbbf24" 
                activeDot={{ r: 8 }} 
                strokeWidth={3}
                name="Citas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}