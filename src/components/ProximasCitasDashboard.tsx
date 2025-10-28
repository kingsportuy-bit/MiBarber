"use client";

import type { Appointment } from "@/types/db";

interface ProximasCitasDashboardProps {
  citas: Appointment[];
}

export function ProximasCitasDashboard({ citas }: ProximasCitasDashboardProps) {
  return (
    <div className="qoder-dark-card p-5 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-qoder-dark-text-primary">Próximas 5 Citas</h3>
        <button className="text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
      {citas.length === 0 ? (
        <div className="text-qoder-dark-text-secondary text-center py-8">
          No hay citas programadas para hoy
        </div>
      ) : (
        <div className="space-y-3">
          {citas.map((cita, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-qoder-dark-bg-secondary hover:bg-qoder-dark-bg-hover transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-qoder-dark-accent-primary flex items-center justify-center mr-3">
                  <span className="text-qoder-dark-text-primary font-semibold text-sm">
                    {cita.hora.substring(0, 5)}
                  </span>
                </div>
                <div>
                  <div className="text-qoder-dark-text-primary font-medium">
                    {cita.cliente_nombre}
                  </div>
                  <div className="text-qoder-dark-text-secondary text-sm">
                    {cita.servicio}
                  </div>
                </div>
              </div>
              <div className="text-qoder-dark-text-secondary text-sm">
                {cita.barbero}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}