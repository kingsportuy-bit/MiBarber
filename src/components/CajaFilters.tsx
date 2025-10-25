"use client";

import { useState, useEffect } from "react";

import { CustomDatePicker } from "@/components/CustomDatePicker";

interface CajaFiltersProps {
  sucursalId?: string;
  setSucursalId?: React.Dispatch<React.SetStateAction<string | undefined>>;
  barberoId?: string;
  setBarberoId?: React.Dispatch<React.SetStateAction<string | undefined>>;
  fechaDesde?: Date;
  setFechaDesde?: React.Dispatch<React.SetStateAction<Date | undefined>>;
  fechaHasta?: Date;
  setFechaHasta?: React.Dispatch<React.SetStateAction<Date | undefined>>;
  sucursales?: {
    id: string;
    nombre_sucursal?: string;
    numero_sucursal?: number;
  }[];
  barberos?: {
    id_barbero: string;
    nombre: string;
  }[];
  isAdmin?: boolean;
}

export function CajaFilters({ 
  sucursalId, 
  setSucursalId, 
  barberoId, 
  setBarberoId, 
  fechaDesde, 
  setFechaDesde, 
  fechaHasta, 
  setFechaHasta,
  sucursales,
  barberos,
  isAdmin
}: CajaFiltersProps) {
  // Convertir Date a string para el componente CustomDatePicker
  const fechaDesdeString = fechaDesde ? fechaDesde.toISOString().split('T')[0] : '';
  const fechaHastaString = fechaHasta ? fechaHasta.toISOString().split('T')[0] : '';
  
  return (
    <div className="qoder-dark-card p-4 mb-4">
      <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-3">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {isAdmin && (
          <div>
            <label className="text-sm text-qoder-dark-text-secondary font-medium">Sucursal</label>
            <select
              value={sucursalId || ""}
              onChange={(e) => setSucursalId && setSucursalId(e.target.value || undefined)}
              className="w-full qoder-dark-select mt-2"
            >
              <option value="">Todas</option>
              {sucursales?.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div>
          <label className="text-sm text-qoder-dark-text-secondary font-medium">Barbero</label>
          <select
            value={barberoId || ""}
            onChange={(e) => setBarberoId && setBarberoId(e.target.value || undefined)}
            className="w-full qoder-dark-select mt-2"
          >
            <option value="">Todos</option>
            {barberos?.map((barbero) => (
              <option key={barbero.id_barbero} value={barbero.id_barbero}>
                {barbero.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm text-qoder-dark-text-secondary font-medium">Fecha desde</label>
          <CustomDatePicker
            value={fechaDesdeString}
            onChange={(date) => setFechaDesde && setFechaDesde(new Date(date))}
            placeholder="Desde"
          />
        </div>
        
        <div>
          <label className="text-sm text-qoder-dark-text-secondary font-medium">Fecha hasta</label>
          <CustomDatePicker
            value={fechaHastaString}
            onChange={(date) => setFechaHasta && setFechaHasta(new Date(date))}
            placeholder="Hasta"
          />
        </div>
      </div>
    </div>
  );
}