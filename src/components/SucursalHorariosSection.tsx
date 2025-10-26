"use client";

import React, { useState } from "react";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { HorariosSucursalForm } from "./HorariosSucursalForm";
import { HorarioDisplay } from "./HorarioDisplay";

interface SucursalHorariosSectionProps {
  idSucursal: string;
}

export function SucursalHorariosSection({ 
  idSucursal
}: SucursalHorariosSectionProps) {
  const [showHorariosForm, setShowHorariosForm] = useState(false);
  const { horarios, isLoading, isError } = useHorariosSucursales(idSucursal);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary">
          Horarios de la Sucursal
        </h3>
        <button
          onClick={() => setShowHorariosForm(true)}
          className="bg-qoder-dark-accent-primary hover:bg-qoder-dark-accent-hover text-white px-3 py-1 text-sm rounded-lg transition-colors duration-200"
        >
          {horarios.length > 0 ? "Editar Horarios" : "Configurar Horarios"}
        </button>
      </div>

      {isLoading ? (
        <div className="text-qoder-dark-text-secondary">Cargando horarios...</div>
      ) : isError ? (
        <div className="text-red-500">Error al cargar los horarios</div>
      ) : horarios.length > 0 ? (
        <div className="space-y-4">
          <HorarioDisplay idSucursal={idSucursal} />
        </div>
      ) : (
        <div className="text-center py-4 bg-qoder-dark-bg-form rounded-lg border border-qoder-dark-border-primary">
          <p className="text-qoder-dark-text-secondary mb-2">
            No hay horarios configurados
          </p>
        </div>
      )}

      {showHorariosForm && (
        <HorariosSucursalForm 
          idSucursal={idSucursal} 
          onClose={() => setShowHorariosForm(false)} 
        />
      )}
    </div>
  );
}