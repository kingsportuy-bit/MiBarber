"use client";

import { useState, useEffect } from "react";
import { useEstadisticas } from "@/hooks/useEstadisticas";
import { StatCard } from "@/components/StatCard";
import { GraficaBarras } from "@/components/GraficaBarras";
import { GraficaLineas } from "@/components/GraficaLineas";
import { GraficaTorta } from "@/components/GraficaTorta";
import { ExportarEstadisticasCompleto } from "@/components/ExportarEstadisticasCompleto";
import { useBarberos } from "@/hooks/useBarberos";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { SucursalesStatsPanel } from "@/components/SucursalesStatsPanel";
import type { Sucursal } from "@/types/db";

interface AdminStatsViewProps {
  periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
}

export function AdminStatsView({ periodo }: AdminStatsViewProps) {
  const { idBarberia } = useBarberoAuth();
  const [activeTab, setActiveTab] = useState<"sucursales" | "barberos" | "clientes">("sucursales");
  const [filtroBarbero, setFiltroBarbero] = useState<"todos" | "porSucursal" | "individual">("todos");
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string | null>(null);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  
  // Establecer fechas por defecto
  useEffect(() => {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Formatear fechas como YYYY-MM-DD
    const formatoFecha = (fecha: Date) => fecha.toISOString().split('T')[0];
    
    setFechaDesde(formatoFecha(primerDiaMes));
    setFechaHasta(formatoFecha(hoy));
  }, []);
  
  const { adminStats } = useEstadisticas({ 
    periodo,
    sucursalId: activeTab === "sucursales" && sucursalSeleccionada ? sucursalSeleccionada : undefined,
    fechaDesde: activeTab === "sucursales" ? fechaDesde : undefined,
    fechaHasta: activeTab === "sucursales" ? fechaHasta : undefined
  });
  
  // Obtener barberos y sucursales para los filtros
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberos();
  const { sucursales, isLoading: isLoadingSucursales } = useSucursales(idBarberia || undefined);
  
  if (adminStats.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }
  
  if (adminStats.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-qoder-dark-text-primary mb-2">
            Error al cargar estadísticas
          </h3>
          <p className="text-qoder-dark-text-secondary">
            {(adminStats.error as Error).message}
          </p>
        </div>
      </div>
    );
  }
  
  if (!adminStats.data) {
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
  
  const stats = adminStats.data;
  
  // Preparar datos para las gráficas
  const ingresosPorSucursalData = Object.entries(stats.ingresosPorSucursal)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor);
    
  const ingresosPorBarberoData = Object.entries(stats.ingresosPorBarbero)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  const ingresosPorServicioData = Object.entries(stats.ingresosPorServicio)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  const turnosPorHoraData = Object.entries(stats.turnosPorHora)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor);
    
  const productividadBarberoData = Object.entries(stats.productividadBarbero)
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  // Datos para gráficas de torta
  const serviciosRentablesData = Object.entries(stats.serviciosRentables)
    .map(([nombre, valor], index) => ({
      nombre,
      valor,
      color: ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"][index]
    }));
    
  const distribucionClientesData = Object.entries(stats.distribucionClientes)
    .map(([nombre, valor], index) => ({
      nombre,
      valor,
      color: ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"][index]
    }));
    
  // Datos para tendencia de ingresos
  const ingresosTendenciaData = Object.entries(stats.ingresosTendencia)
    .map(([fecha, valor]) => ({ fecha, valor }));

  return (
    <div className="p-6 rounded-lg" style={{ background: 'var(--qoder-dark-bg-quaternary)' }}>
      {/* Pestañas */}
      <div className="flex border-b border-qoder-dark-border-primary">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "sucursales"
              ? "text-qoder-dark-accent-primary border-b-2 border-qoder-dark-accent-primary"
              : "text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary"
          }`}
          onClick={() => setActiveTab("sucursales")}
        >
          Sucursales
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "barberos"
              ? "text-qoder-dark-accent-primary border-b-2 border-qoder-dark-accent-primary"
              : "text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary"
          }`}
          onClick={() => setActiveTab("barberos")}
        >
          Barberos
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "clientes"
              ? "text-qoder-dark-accent-primary border-b-2 border-qoder-dark-accent-primary"
              : "text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary"
          }`}
          onClick={() => setActiveTab("clientes")}
        >
          Clientes
        </button>
      </div>
      
      {/* Contenido de las pestañas */}
        {/* Filtros para la pestaña de sucursales */}
        {activeTab === "sucursales" && (
          <div className="space-y-6">
            <div className="p-4 mb-6" style={{ background: 'var(--qoder-dark-bg-quaternary)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                    Sucursal
                  </label>
                  <select
                    value={sucursalSeleccionada || ""}
                    onChange={(e) => setSucursalSeleccionada(e.target.value || null)}
                    className="qoder-dark-input w-full py-2 px-3"
                    disabled={isLoadingSucursales}
                  >
                    <option value="">Todas las sucursales</option>
                    {sucursales?.map((sucursal: Sucursal) => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
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
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="qoder-dark-input w-full py-2 px-3"
                  />
                </div>
              </div>
            </div>
            
            <SucursalesStatsPanel stats={stats} />
          </div>
        )}
        
        {/* Filtros para la pestaña de barberos */}
        {activeTab === "barberos" && (
          <div className="space-y-6">
            <div className="qoder-dark-card p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                    Filtro de Barberos
                  </label>
                  <select
                    value={filtroBarbero}
                    onChange={(e) => setFiltroBarbero(e.target.value as any)}
                    className="qoder-dark-input w-full py-2 px-3"
                  >
                    <option value="todos">Todos los barberos</option>
                    <option value="porSucursal">Barberos por sucursal</option>
                    <option value="individual">Barbero individual</option>
                  </select>
                </div>
                
                {filtroBarbero === "porSucursal" && (
                  <div>
                    <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                      Seleccionar Sucursal
                    </label>
                    <select
                      value={sucursalSeleccionada || ""}
                      onChange={(e) => setSucursalSeleccionada(e.target.value || null)}
                      className="qoder-dark-input w-full py-2 px-3"
                      disabled={isLoadingSucursales}
                    >
                      <option value="">Todas las sucursales</option>
                      {sucursales?.map((sucursal: Sucursal) => (
                        <option key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {filtroBarbero === "individual" && (
                  <div>
                    <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                      Seleccionar Barbero
                    </label>
                    <select
                      value={barberoSeleccionado || ""}
                      onChange={(e) => setBarberoSeleccionado(e.target.value || null)}
                      className="qoder-dark-input w-full py-2 px-3"
                      disabled={isLoadingBarberos}
                    >
                      <option value="">Todos los barberos</option>
                      {barberos?.map((barbero) => (
                        <option key={barbero.id_barbero} value={barbero.id_barbero}>
                          {barbero.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Ingresos Totales"
                value={`$${stats.ingresosTotales.toFixed(2)}`}
                description="Ingresos del período"
              />
              
              <StatCard
                title="Tasa de Ocupación"
                value={`${stats.tasaOcupacion}%`}
                description="Turnos ocupados"
              />
              
              <StatCard
                title="Tasa de Cancelación"
                value={`${stats.tasaCancelacion}%`}
                description="Turnos cancelados"
              />
              
              <StatCard
                title="Frecuencia de Visitas"
                value={stats.frecuenciaVisitas.toString()}
                description="Visitas por cliente/mes"
              />
            </div>

            {/* Gráficas para barberos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GraficaBarras 
                data={ingresosPorBarberoData} 
                titulo="Ingresos por Barbero" 
                color="bg-qoder-dark-accent-success"
              />
              
              <GraficaBarras 
                data={productividadBarberoData} 
                titulo="Productividad por Barbero" 
                color="bg-qoder-dark-accent-purple"
              />
            </div>
            
            {/* Servicios más rentables */}
            <div>
              <GraficaTorta 
                data={serviciosRentablesData} 
                titulo="Servicios Más Rentables" 
              />
            </div>
          </div>
        )}
        
        {activeTab === "clientes" && (
          <div className="space-y-6">
            {/* KPIs de Clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Clientes Únicos"
                value="1,240"
                description="Clientes este período"
              />
              
              <StatCard
                title="Valor de Cliente"
                value={`$${stats.valorCliente.toFixed(2)}`}
                description="Ingresos por cliente"
              />
              
              <StatCard
                title="Frecuencia de Visitas"
                value={stats.frecuenciaVisitas.toString()}
                description="Visitas por cliente/mes"
              />
              
              <StatCard
                title="Clientes Recurrentes"
                value="68%"
                description="Clientes que regresan"
              />
            </div>

            {/* Distribución de clientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GraficaTorta 
                data={distribucionClientesData} 
                titulo="Distribución de Clientes por Barbero" 
              />
              
              <div className="qoder-dark-card p-6">
                <h3 className="font-semibold text-qoder-dark-text-primary mb-4">
                  Comparativa entre Sucursales
                </h3>
                <div className="space-y-4">
                  {ingresosPorSucursalData.map((sucursal, index) => (
                    <div key={index} className="flex justify-between items-center pb-2 border-b border-qoder-dark-border-primary">
                      <span className="text-qoder-dark-text-primary">{sucursal.nombre}</span>
                      <div className="text-right">
                        <div className="font-medium text-qoder-dark-text-primary">${sucursal.valor.toFixed(2)}</div>
                        <div className="text-xs text-qoder-dark-text-secondary">
                          {index === 0 ? "+12.5%" : index === 1 ? "+8.3%" : "+5.7%"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}