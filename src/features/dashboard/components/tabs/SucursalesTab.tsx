"use client";

import { useState } from "react";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { GlobalFilters } from '@/components/shared/GlobalFilters';
import { RevenueWidget } from "@/features/dashboard/components/widgets/RevenueWidget";
import { OccupancyWidget } from "@/features/dashboard/components/widgets/OccupancyWidget";
import { CancellationWidget } from "@/features/dashboard/components/widgets/CancellationWidget";
import { ClientsWidget } from "@/features/dashboard/components/widgets/ClientsWidget";
import type { AdminEstadisticas } from "@/hooks/useEstadisticas";
import type { ChartData, LineChartData, PieChartData } from "@/features/dashboard/types";
import type { Sucursal } from "@/types/db";

interface SucursalesTabProps {
  stats: any;
  sucursalSeleccionada: string | null;
  onSucursalChange: (sucursalId: string | null) => void;
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (fecha: string) => void;
  onFechaHastaChange: (fecha: string) => void;
}

export function SucursalesTab({
  stats,
  sucursalSeleccionada,
  onSucursalChange,
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange
}: SucursalesTabProps) {
  const { idBarberia } = useBarberoAuth();
  const { sucursales, isLoading: isLoadingSucursales } = useSucursales(idBarberia || undefined);
  
  // Preparar datos para las gráficas
  const ingresosPorSucursalData = Object.entries(stats.ingresosPorSucursal)
    .map(([id, valor]) => {
      // Buscar el nombre de la sucursal
      const sucursal = sucursales?.find((s: Sucursal) => s.id === id);
      const nombre = sucursal ? (sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`) : `ID: ${id}`;
      return { nombre, valor: valor as number };
    })
    .sort((a, b) => b.valor - a.valor);
    
  const ingresosPorServicioData = Object.entries(stats.ingresosPorServicio)
    .map(([nombre, valor]) => ({ nombre, valor: valor as number }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  const turnosPorHoraData = Object.entries(stats.turnosPorHora)
    .map(([hora, valor]) => {
      // Formatear la hora para que sea más legible
      const horaFormateada = `${hora}:00`;
      return { nombre: horaFormateada, valor: valor as number };
    })
    .sort((a, b) => {
      // Ordenar por hora
      const horaA = parseInt(a.nombre.split(':')[0]);
      const horaB = parseInt(b.nombre.split(':')[0]);
      return horaA - horaB;
    });
    
  // Datos para gráficas de torta
  const serviciosRentablesData = Object.entries(stats.serviciosRentables)
    .map(([nombre, valor], index) => ({
      nombre,
      valor: valor as number,
      color: ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"][index % 5]
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  // Datos para tendencia de ingresos
  const ingresosTendenciaData = Object.entries(stats.ingresosTendencia)
    .map(([fecha, valor]) => ({ fecha, valor: valor as number }));

  // Calcular cantidad total de servicios
  const totalServicios = Object.values(stats.turnosPorHora).reduce((a, b) => (a as number) + (b as number), 0) as number;

  return (
    <div className="space-y-6">
      <div className="p-4 mb-6" style={{ background: 'var(--qoder-dark-bg-quaternary)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtros globales */}
          <GlobalFilters 
            showBarberoFilter={false}
            showDateFilters={false}
          />

          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
              Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className="qoder-dark-input w-full py-2 px-3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="qoder-dark-input w-full py-2 px-3"
            />
          </div>
        </div>
      </div>
      
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueWidget
          value={stats.ingresosTotales}
          description="Ingresos del período"
        />
        
        <OccupancyWidget
          value={stats.tasaOcupacion}
          description="Turnos ocupados"
        />
        
        <CancellationWidget
          value={stats.tasaCancelacion}
          description="Turnos cancelados"
        />
        
        <ClientsWidget
          title="Frecuencia de Visitas"
          value={stats.frecuenciaVisitas.toString()}
          description="Visitas por cliente/mes"
        />
      </div>
      
      {/* Gráficas adicionales */}
      <div className="dashboard-grid">
        <div className="qoder-dark-card">
          <div className="dashboard-card-header">
            <h2>Ingresos por Sucursal</h2>
            <button className="qoder-dark-button">Opciones</button>
          </div>
          <p className="dashboard-subtitle">Total de ingresos generados por cada sucursal</p>
          <div className="dashboard-chart-container">
            {/* Componente BarChart eliminado */}
          </div>
        </div>
        
        <div className="qoder-dark-card">
          <div className="dashboard-card-header">
            <h2>Tendencia de Ingresos</h2>
            <div className="dashboard-controls">
              <button className="qoder-dark-button qoder-dark-button-orange">1M</button>
              <button className="qoder-dark-button">3M</button>
              <button className="qoder-dark-button">1A</button>
            </div>
          </div>
          <p className="dashboard-subtitle">Evolución de ingresos a lo largo del tiempo</p>
          <div className="dashboard-chart-container">
            {/* Componente LineChart eliminado */}
          </div>
        </div>
      </div>
      
      {/* Sección de comparativas */}
      <div className="dashboard-grid">
        <div className="qoder-dark-card">
          <h2>Ingresos por Tipo de Servicio</h2>
          <p className="dashboard-subtitle">Distribución de ingresos según tipo de servicio</p>
          <div className="dashboard-chart-container">
            {/* Componente BarChart eliminado */}
          </div>
        </div>
        
        <div className="qoder-dark-card">
          <h2>Servicios Más Rentables</h2>
          <p className="dashboard-subtitle">Top 5 servicios con mayor margen de ganancia</p>
          <div className="dashboard-chart-container">
            {/* Componente BarChart eliminado */}
          </div>
        </div>
      </div>
      
      {/* Distribución de turnos */}
      <div className="qoder-dark-card">
        <h2>Distribución de Turnos por Hora</h2>
        <p className="dashboard-subtitle">Cantidad de turnos programados en cada franja horaria</p>
        <div className="dashboard-chart-container">
          {/* Componente BarChart eliminado */}
        </div>
      </div>
    </div>
  );
}