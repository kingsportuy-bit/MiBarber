"use client";

import type { Appointment } from "@/types/db";

interface ProximasCitasDashboardProps {
  citas: Appointment[];
}

export function ProximasCitasDashboard({ citas }: ProximasCitasDashboardProps) {
  return (
    <div className="qoder-dark-card">
      <h3 className="font-semibold text-qoder-dark-text-primary mb-4">Próximas 5 Citas</h3>
      {citas.length === 0 ? (
        <div className="text-qoder-dark-text-secondary text-center py-4">
          No hay citas programadas para hoy
        </div>
      ) : (
        <div className="space-y-3">
          {citas.map((cita, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded bg-qoder-dark-bg-secondary">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-qoder-dark-bg-tertiary flex items-center justify-center mr-3">
                  <span className="text-qoder-dark-text-primary font-semibold">
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