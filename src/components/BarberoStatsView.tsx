"use client";

import { useState, useEffect } from "react";
import { useEstadisticas } from "@/hooks/useEstadisticas";
import { StatCard } from "@/components/StatCard";
import { GraficaBarras } from "@/components/GraficaBarras";
import { GraficaLineas } from "@/components/GraficaLineas";
import { GraficaTorta } from "@/components/GraficaTorta";
import { HeatmapHorarios } from "@/components/HeatmapHorarios";
import { GraficaFunnel } from "@/components/GraficaFunnel";
import { ExportarEstadisticasBarbero } from "@/components/ExportarEstadisticasBarbero";

interface BarberoStatsViewProps {
  barberoId: string;
  periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
}

export function BarberoStatsView({ barberoId, periodo }: BarberoStatsViewProps) {
  const { barberoStats } = useEstadisticas({ periodo, barberoId });
  
  if (barberoStats.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }
  
  if (barberoStats.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-qoder-dark-text-primary mb-2">
            Error al cargar estadísticas
          </h3>
          <p className="text-qoder-dark-text-secondary">
            {(barberoStats.error as Error).message}
          </p>
        </div>
      </div>
    );
  }
  
  if (!barberoStats.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-qoder-dark-text-primary">
            No hay datos disponibles
          </h3>
        </div>
      </div>
    );
  }
  
  const stats = barberoStats.data;
  
  // Preparar datos para las gráficas
  const serviciosPopularesData = Object.entries(stats.serviciosPopulares)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  // Datos simulados para el mapa de calor (en una implementación real, vendrían del hook)
  const horariosPicoData = {
    "Lun 09:00": 3,
    "Lun 11:00": 5,
    "Lun 14:00": 2,
    "Lun 16:00": 4,
    "Mar 09:00": 4,
    "Mar 11:00": 6,
    "Mar 14:00": 3,
    "Mar 16:00": 5,
    "Mié 09:00": 2,
    "Mié 11:00": 4,
    "Mié 14:00": 1,
    "Mié 16:00": 3,
    "Jue 09:00": 5,
    "Jue 11:00": 7,
    "Jue 14:00": 4,
    "Jue 16:00": 6,
    "Vie 09:00": 4,
    "Vie 11:00": 6,
    "Vie 14:00": 2,
    "Vie 16:00": 5,
    "Sáb 09:00": 4,
    "Sáb 11:00": 3,
    "Sáb 15:00": 2
  };
    
  // Datos simulados para la tendencia (en una implementación real, vendrían del hook)
  const ingresosTendenciaData = [
    { fecha: "Sem 1", valor: stats.ingresosGenerados * 0.7 },
    { fecha: "Sem 2", valor: stats.ingresosGenerados * 0.8 },
    { fecha: "Sem 3", valor: stats.ingresosGenerados * 0.9 },
    { fecha: "Sem 4", valor: stats.ingresosGenerados },
  ];
  
  // Datos para distribución de servicios
  const distribucionServiciosData = serviciosPopularesData.map((item, index) => ({
    ...item,
    color: ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"][index]
  }));
  
  // Datos para el funnel de conversión
  const funnelData = [
    { etapa: "Turnos Agendados", valor: stats.turnosCompletados + 5 }, // Simulando turnos agendados
    { etapa: "Turnos Asistidos", valor: stats.turnosCompletados },
    { etapa: "Clientes Satisfechos", valor: Math.round(stats.turnosCompletados * 0.9) }, // Simulando satisfacción
    { etapa: "Clientes Recurrentes", valor: Math.round(stats.turnosCompletados * 0.65) } // Simulando retención
  ];

  return (
    <div className="space-y-6">
      {/* Botón de exportación a PDF */}
      <div className="flex justify-end">
        {stats && (
          <ExportarEstadisticasBarbero 
            data={stats} 
            filename={`estadisticas-barbero-${periodo}`} 
          />
        )}
      </div>
      
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos Generados"
          value={`$${stats.ingresosGenerados.toFixed(2)}`}
          description="Total facturado"
        />
        
        <StatCard
          title="Turnos Completados"
          value={stats.turnosCompletados.toString()}
          description="Servicios realizados"
        />
        
        <StatCard
          title="Ticket Promedio"
          value={`$${stats.ticketPromedio.toFixed(2)}`}
          description="Ingreso por cliente"
        />
        
        <StatCard
          title="Tasa de Utilización"
          value={`${stats.tasaUtilizacion}%`}
          description="Horas ocupadas"
        />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficaLineas 
          data={ingresosTendenciaData} 
          titulo="Tendencia de Ingresos" 
          color="text-qoder-dark-accent-primary"
        />
        
        <GraficaFunnel 
          data={funnelData} 
          titulo="Funnel de Conversión" 
        />
      </div>

      {/* Sección adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HeatmapHorarios 
            data={horariosPicoData} 
            titulo="Horarios Pico" 
          />
        </div>
        
        <div className="space-y-6">
          <StatCard
            title="Tasa de Retención"
            value={`${stats.tasaRetencion}%`}
            description="Clientes recurrentes"
          />
          
          <GraficaTorta 
            data={distribucionServiciosData} 
            titulo="Distribución de Servicios" 
          />
        </div>
      </div>
      
      {/* Servicios más populares */}
      <div>
        <GraficaBarras 
          data={serviciosPopularesData} 
          titulo="Servicios Más Solicitados" 
          color="bg-qoder-dark-accent-secondary"
        />
      </div>
    </div>
  );
}