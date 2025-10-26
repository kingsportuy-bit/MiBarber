"use client";

import { BarberoStats } from "@/hooks/useBarberoStats";

interface BarberoMiniDashboardProps {
  stats: BarberoStats;
}

export function BarberoMiniDashboard({ stats }: BarberoMiniDashboardProps) {
  return (
    <div className="qoder-dark-card p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-qoder-dark-text-primary">{stats.nombre}</h3>
        <span className="text-xs bg-qoder-dark-bg-secondary text-qoder-dark-text-secondary px-2 py-1 rounded">
          {stats.especialidades.join(", ") || "Sin especialidades"}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-qoder-dark-bg-secondary p-3 rounded">
          <div className="text-xs text-qoder-dark-text-secondary">Citas Atendidas</div>
          <div className="text-lg font-bold text-qoder-dark-text-primary">{stats.turnos_atendidos}</div>
        </div>
        
        <div className="bg-qoder-dark-bg-secondary p-3 rounded">
          <div className="text-xs text-qoder-dark-text-secondary">Ingresos</div>
          <div className="text-lg font-bold text-qoder-dark-text-primary">${stats.ingresos_generados.toFixed(2)}</div>
        </div>
        
        <div className="bg-qoder-dark-bg-secondary p-3 rounded">
          <div className="text-xs text-qoder-dark-text-secondary">Servicios</div>
          <div className="text-lg font-bold text-qoder-dark-text-primary">{stats.servicios_realizados}</div>
        </div>
        
        <div className="bg-qoder-dark-bg-secondary p-3 rounded">
          <div className="text-xs text-qoder-dark-text-secondary">Última Cita</div>
          <div className="text-sm text-qoder-dark-text-primary">
            {stats.ultimo_turno 
              ? new Date(stats.ultimo_turno).toLocaleDateString('es-UY') 
              : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}