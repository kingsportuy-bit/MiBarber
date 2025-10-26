"use client";

import type { Appointment } from "@/types/db";

interface ProximasCitasProps {
  citas: Appointment[];
}

export function ProximasCitas({ citas }: ProximasCitasProps) {
  if (citas.length === 0) {
    return (
      <div className="qoder-dark-card p-6 text-center">
        <p className="text-qoder-dark-text-secondary">No hay citas programadas para hoy</p>
      </div>
    );
  }

  return (
    <div className="qoder-dark-card">
      <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Próximas 5 citas del día</h3>
      <div className="space-y-3">
        {citas.map((cita) => (
          <div key={cita.id_cita} className="flex items-center justify-between p-3 bg-qoder-dark-bg-form rounded-lg">
            <div>
              <div className="font-medium text-qoder-dark-text-primary">{cita.hora?.slice(0, 5)}</div>
              <div className="text-sm text-qoder-dark-text-secondary">{cita.cliente_nombre}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-qoder-dark-text-primary">{cita.barbero}</div>
              <div className="text-sm text-qoder-dark-text-secondary">{cita.servicio}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}