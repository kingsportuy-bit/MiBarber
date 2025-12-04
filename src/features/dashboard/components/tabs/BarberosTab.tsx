"use client";

import { useBarberos } from "@/hooks/useBarberos";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { GlobalFilters } from '@/components/shared/GlobalFilters';
import { RevenueWidget } from "@/features/dashboard/components/widgets/RevenueWidget";
import { OccupancyWidget } from "@/features/dashboard/components/widgets/OccupancyWidget";
import { CancellationWidget } from "@/features/dashboard/components/widgets/CancellationWidget";
import { ClientsWidget } from "@/features/dashboard/components/widgets/ClientsWidget";
import type { ChartData, PieChartData } from "@/features/dashboard/types";
import type { Sucursal } from "@/types/db";

interface BarberosTabProps {
  stats: any;
  filtroBarbero: 'todos' | 'porSucursal' | 'individual';
  onFiltroBarberoChange: (filtro: 'todos' | 'porSucursal' | 'individual') => void;
  sucursalSeleccionada: string | null;
  onSucursalChange: (sucursalId: string | null) => void;
  barberoSeleccionado: string | null;
  onBarberoChange: (barberoId: string | null) => void;
}

export function BarberosTab({
  stats,
  filtroBarbero,
  onFiltroBarberoChange,
  sucursalSeleccionada,
  onSucursalChange,
  barberoSeleccionado,
  onBarberoChange
}: BarberosTabProps) {
  const { idBarberia } = useBarberoAuth();
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberos();
  const { sucursales, isLoading: isLoadingSucursales } = useSucursales(idBarberia || undefined);
  
  // Preparar datos para las gráficas
  const ingresosPorBarberoData = Object.entries(stats.ingresosPorBarbero)
    .map(([nombre, valor]) => ({ nombre, valor: valor as number }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  const productividadBarberoData = Object.entries(stats.productividadBarbero)
    .map(([nombre, valor]) => ({ nombre, valor: valor as number }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);
    
  // Datos para gráficas de torta
  const serviciosRentablesData = Object.entries(stats.serviciosRentables)
    .map(([nombre, valor], index) => ({
      nombre,
      valor: valor as number,
      color: ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"][index]
    }));

  return (
    <div className="space-y-6">
      <div className="qoder-dark-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
              Filtro de Barberos
            </label>
            <select
              value={filtroBarbero}
              onChange={(e) => onFiltroBarberoChange(e.target.value as any)}
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
              {/* Filtros globales solo para sucursal */}
              <GlobalFilters 
                showBarberoFilter={false}
                showDateFilters={false}
              />
            </div>
          )}
          
          {filtroBarbero === "individual" && (
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                Seleccionar Barbero
              </label>
              {/* Filtros globales solo para barbero */}
              <GlobalFilters 
                showSucursalFilter={false}
                showDateFilters={false}
              />
            </div>
          )}

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

      {/* Gráficas para barberos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
      </div>
      
      {/* Servicios más rentables */}
      <div>
        {/* Componente PieChart eliminado */}
      </div>
    </div>
  );
}