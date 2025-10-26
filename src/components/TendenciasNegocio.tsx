"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
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

interface TendenciasNegocioProps {
  estadisticas: EstadisticasCompletas | null;
}

export function TendenciasNegocio({ estadisticas }: TendenciasNegocioProps) {
  const datosServicios = useMemo(() => {
    if (!estadisticas) return [];
    
    // Convertir serviciosPopulares a formato para la gráfica
    return Object.entries(estadisticas.serviciosPopulares || {})
      .map(([servicio, cantidad]: [string, number]) => ({ servicio, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8);
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
                tickFormatter={(value: string) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
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
                fill="#60a5fa" 
                name="Cantidad"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Citas por día de la semana */}
      <div className="qoder-dark-card p-4">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Citas por día de la semana</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={Object.entries(estadisticas.citasPorDia || {})
                .map(([dia, cantidad]: [string, number]) => ({ dia, cantidad }))
                .sort((a: { dia: string; cantidad: number }, b: { dia: string; cantidad: number }) => {
                  const diasOrden = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                  return diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia);
                })}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                dataKey="cantidad" 
                fill="#fbbf24" 
                name="Citas"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}