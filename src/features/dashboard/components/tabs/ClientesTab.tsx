"use client";

import { ClientsWidget } from "@/features/dashboard/components/widgets/ClientsWidget";

import type { ChartData, PieChartData } from "@/features/dashboard/types";

interface ClientesTabProps {
  stats: any;
}

export function ClientesTab({ stats }: ClientesTabProps) {
  // Preparar datos para las gráficas
  const ingresosPorSucursalData = Object.entries(stats.ingresosPorSucursal)
    .map(([nombre, valor]) => ({ nombre, valor: valor as number }))
    .sort((a, b) => b.valor - a.valor);
    
  // Datos para gráficas de torta
  const distribucionClientesData = Object.entries(stats.distribucionClientes)
    .map(([nombre, valor], index) => ({
      nombre,
      valor: valor as number,
      color: ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"][index]
    }));

  return (
    <div className="space-y-6">
      {/* KPIs de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ClientsWidget
          title="Clientes Únicos"
          value="1,240"
          description="Clientes este período"
        />
        
        <ClientsWidget
          title="Valor de Cliente"
          value={`$${stats.valorCliente.toFixed(2)}`}
          description="Ingresos por cliente"
        />
        
        <ClientsWidget
          title="Frecuencia de Visitas"
          value={stats.frecuenciaVisitas.toString()}
          description="Visitas por cliente/mes"
        />
        
        <ClientsWidget
          title="Clientes Recurrentes"
          value="68%"
          description="Clientes que regresan"
        />
      </div>

      {/* Distribución de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Componente PieChart eliminado */}
        
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
  );
}