"use client";

import { StatCard } from "@/components/StatCard";

interface BarberoStats {
  id_barbero: string;
  nombre: string;
  turnos_atendidos: number;
  ingresos_generados: number;
  servicios_realizados: number;
  ultimo_turno: string | null;
  especialidades: string[];
}

interface BarberoStatsCardProps {
  stats: BarberoStats;
}

export function BarberoStatsCard({ stats }: BarberoStatsCardProps) {
  return (
    <div className="qoder-dark-card">
      <div className="qoder-dark-window-header">
        <h3 className="font-semibold text-qoder-dark-text-primary">{stats.nombre}</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Turnos Atendidos"
            value={stats.turnos_atendidos.toString()}
            description="Total de turnos completados"
          />
          
          <StatCard
            title="Ingresos"
            value={`$${stats.ingresos_generados.toFixed(2)}`}
            description="Generados desde caja"
          />
          
          <StatCard
            title="Servicios"
            value={stats.servicios_realizados.toString()}
            description="Servicios realizados"
          />
          
          <StatCard
            title="Último Turno"
            value={stats.ultimo_turno ? stats.ultimo_turno : "N/A"}
            description="Fecha del último turno"
          />
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-qoder-dark-text-secondary mb-2">
            Especialidades
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.especialidades && stats.especialidades.length > 0 ? (
              stats.especialidades.map((esp, index) => (
                <span 
                  key={index} 
                  className="bg-qoder-dark-bg-secondary text-qoder-dark-text-secondary text-xs px-2 py-1 rounded"
                >
                  {esp}
                </span>
              ))
            ) : (
              <span className="text-qoder-dark-text-secondary text-sm">
                Sin especialidades registradas
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}