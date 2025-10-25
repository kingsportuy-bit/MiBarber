"use client";

import type { Sucursal } from "@/types/db";

interface SucursalInfoCardProps {
  sucursal: Sucursal;
}

export function SucursalInfoCard({ sucursal }: SucursalInfoCardProps) {
  return (
    <div className="qoder-dark-card p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-qoder-dark-text-primary">
            {sucursal.nombre_sucursal || "Sucursal sin nombre"}
          </h3>
          <p className="text-qoder-dark-text-secondary text-sm">
            Sucursal #{sucursal.numero_sucursal}
          </p>
        </div>
        <span className="bg-qoder-dark-bg-secondary text-qoder-dark-text-secondary text-xs px-2 py-1 rounded">
          Activa
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-xs uppercase tracking-wider text-qoder-dark-text-secondary mb-1">
            Contacto
          </h4>
          <p className="text-qoder-dark-text-primary">
            {sucursal.celular || sucursal.telefono || "No especificado"}
          </p>
        </div>
        
        <div>
          <h4 className="text-xs uppercase tracking-wider text-qoder-dark-text-secondary mb-1">
            Dirección
          </h4>
          <p className="text-qoder-dark-text-primary">
            {sucursal.direccion || "No especificada"}
          </p>
        </div>
        
        <div>
          <h4 className="text-xs uppercase tracking-wider text-qoder-dark-text-secondary mb-1">
            Horarios
          </h4>
          <p className="text-qoder-dark-text-primary">
            {sucursal.horario || "No especificado"}
          </p>
        </div>
      </div>
    </div>
  );
}