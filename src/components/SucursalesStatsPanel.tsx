"use client";

import { useState, useEffect } from "react";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { StatCard } from "@/components/StatCard";
import { GraficaBarras } from "@/components/GraficaBarras";
import { GraficaLineas } from "@/components/GraficaLineas";
import { GraficaTorta } from "@/components/GraficaTorta";
import type { Sucursal } from "@/types/db";
import type { AdminEstadisticas } from "@/hooks/useEstadisticas";

interface SucursalesStatsPanelProps {
  stats: AdminEstadisticas;
}

export function SucursalesStatsPanel({ stats }: SucursalesStatsPanelProps) {
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
  
  // Calcular ingresos totales sumando todos los ingresos por sucursal
  const ingresosTotales = Object.values(stats.ingresosPorSucursal).reduce((a, b) => (a as number) + (b as number), 0) as number;
  
  // Calcular tasa de ocupación (simulada)
  const tasaOcupacion = 85; // Valor simulado, en una implementación real vendría de los datos
  
  // Calcular tasa de cancelación (simulada)
  const tasaCancelacion = 12; // Valor simulado, en una implementación real vendría de los datos

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Header con título y controles */}
        <div className="dashboard-header">
          <div>
            <h1>Estadísticas de Sucursales</h1>
            <p className="dashboard-subtitle">Resumen de rendimiento por ubicación</p>
          </div>
          <div className="dashboard-controls">
            <div className="dashboard-subtitle">Últimos 30 días</div>
            <button className="qoder-dark-button">
              Filtrar
            </button>
          </div>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-description">Ingresos Totales</div>
            <div className="stat-number">${ingresosTotales.toFixed(2)}</div>
            <div className="dashboard-subtitle">Ingresos del período</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-description">Cantidad de Servicios</div>
            <div className="stat-number">{totalServicios.toString()}</div>
            <div className="dashboard-subtitle">Servicios realizados</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-description">Ticket Promedio</div>
            <div className="stat-number">${(ingresosTotales / Math.max(totalServicios, 1)).toFixed(2)}</div>
            <div className="dashboard-subtitle">Promedio por servicio</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-description">Tasa de Ocupación</div>
            <div className="stat-number">{tasaOcupacion}%</div>
            <div className="dashboard-subtitle">Turnos ocupados</div>
          </div>
        </div>
        
        {/* Mejor Barbero y Servicio Más Vendido */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-description">Mejor Barbero</div>
            <div className="stat-number">
              {Object.keys(stats.ingresosPorBarbero)
                .sort((a, b) => (stats.ingresosPorBarbero[b] as number) - (stats.ingresosPorBarbero[a] as number))[0] || "N/A"}
            </div>
            <div className="dashboard-subtitle">Barbero con más ingresos</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-description">Servicio Más Vendido</div>
            <div className="stat-number">
              {Object.keys(stats.ingresosPorServicio)
                .sort((a, b) => (stats.ingresosPorServicio[b] as number) - (stats.ingresosPorServicio[a] as number))[0] || "N/A"}
            </div>
            <div className="dashboard-subtitle">Servicio con más ventas</div>
          </div>
        </div>
        
        {/* Horarios pico */}
        <div className="qoder-dark-card">
          <div className="dashboard-card-header">
            <h2>Horarios Pico</h2>
            <div className="dashboard-controls">
              <button className="qoder-dark-button">Diario</button>
              <button className="qoder-dark-button">Semanal</button>
              <button className="qoder-dark-button">Mensual</button>
            </div>
          </div>
          <p className="dashboard-subtitle">Cantidad de turnos programados por hora del día</p>
          <div className="dashboard-chart-container">
            <GraficaBarras 
              data={turnosPorHoraData} 
              titulo="" 
              color="bg-qoder-dark-accent-primary"
            />
          </div>
        </div>
        
        {/* Servicios realizados y cancelados */}
        <div className="qoder-dark-card">
          <h2>Servicios Realizados vs Cancelados</h2>
          <p className="dashboard-subtitle">Comparativa entre turnos completados y cancelados</p>
          <div className="dashboard-chart-container">
            <GraficaBarras 
              data={[
                { nombre: "Realizados", valor: totalServicios },
                { nombre: "Cancelados", valor: Math.round((tasaCancelacion / 100) * totalServicios) }
              ]} 
              titulo="" 
              color="bg-qoder-dark-accent-success"
            />
          </div>
          <div className="dashboard-grid" style={{ marginTop: '20px' }}>
            <div className="stat-card">
              <div className="stat-description">Servicios Realizados</div>
              <div className="stat-number">{totalServicios.toString()}</div>
              <div className="dashboard-subtitle">Total de servicios completados</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-description">Tasa de Cancelación</div>
              <div className="stat-number">{tasaCancelacion}%</div>
              <div className="dashboard-subtitle">Porcentaje de turnos cancelados</div>
            </div>
          </div>
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
              <GraficaBarras 
                data={ingresosPorSucursalData} 
                titulo="" 
                color="bg-qoder-dark-accent-secondary"
              />
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
              <GraficaLineas 
                data={ingresosTendenciaData} 
                titulo="" 
                color="text-qoder-dark-accent-primary"
              />
            </div>
          </div>
        </div>
        
        {/* Sección de comparativas */}
        <div className="dashboard-grid">
          <div className="qoder-dark-card">
            <h2>Ingresos por Tipo de Servicio</h2>
            <p className="dashboard-subtitle">Distribución de ingresos según tipo de servicio</p>
            <div className="dashboard-chart-container">
              <GraficaBarras 
                data={ingresosPorServicioData} 
                titulo="" 
                color="bg-qoder-dark-accent-warning"
              />
            </div>
          </div>
          
          <div className="qoder-dark-card">
            <h2>Servicios Más Rentables</h2>
            <p className="dashboard-subtitle">Rentabilidad promedio por tipo de servicio</p>
            <div className="dashboard-chart-container">
              <GraficaTorta 
                data={serviciosRentablesData} 
                titulo="" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}