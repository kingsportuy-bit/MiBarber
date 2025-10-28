"use client";

import type { Sucursal } from "@/types/db";

interface SucursalInfoCardProps {
  sucursal: Sucursal;
  onEdit?: () => void;
  onEditHorarios?: () => void;
}

export function SucursalInfoCard({ sucursal, onEdit, onEditHorarios }: SucursalInfoCardProps) {
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
        <div className="flex space-x-2">
          <button
            onClick={onEditHorarios}
            className="bg-qoder-dark-accent-primary hover:bg-qoder-dark-accent-hover text-white px-3 py-1 text-sm rounded-lg transition-colors duration-200"
          >
            Editar horarios
          </button>
          <button
            onClick={onEdit}
            className="bg-qoder-dark-accent-primary hover:bg-qoder-dark-accent-hover text-white px-3 py-1 text-sm rounded-lg transition-colors duration-200"
          >
            Editar sucursal
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-xs uppercase tracking-wider text-qoder-dark-text-secondary mb-1">
            Contacto
          </h4>
          <p className="text-qoder-dark-text-primary">
            {sucursal.telefono || "No especificado"}
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
            Información Adicional
          </h4>
          <p className="text-qoder-dark-text-primary">
            {sucursal.info || "No especificada"}
          </p>
        </div>
      </div>
    </div>
  );
}
