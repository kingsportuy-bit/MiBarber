"use client";

import React from "react";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { CustomDatePicker } from "@/components/CustomDatePicker";

interface GlobalFiltersProps {
  className?: string;
  showSucursalFilter?: boolean;
  showBarberoFilter?: boolean;
  showDateFilters?: boolean;
}

export function GlobalFilters({ 
  className = "",
  showSucursalFilter = true,
  showBarberoFilter = true,
  showDateFilters = true
}: GlobalFiltersProps) {
  const { 
    filters, 
    setFilters, 
    sucursales, 
    barberos, 
    isLoadingSucursales, 
    isLoadingBarberos,
    isAdmin,
    barbero
  } = useGlobalFilters();

  // Para barberos normales, no mostrar los filtros
  if (!isAdmin) {
    return null;
  }

  // Filtrar barberos por sucursal seleccionada
  const barberosFiltrados = filters.sucursalId 
    ? barberos?.filter((b: any) => b.id_sucursal === filters.sucursalId)
    : barberos;

  const handleSucursalChange = (value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      sucursalId: value || null,
      barberoId: null
    }));
  };

  const handleBarberoChange = (value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      barberoId: value || null
    }));
  };

  const handleFechaInicioChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      fechaInicio: value || null
    }));
  };

  const handleFechaFinChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      fechaFin: value || null
    }));
  };

  return (
    <div className={`flex flex-wrap gap-3 items-end ${className}`}>
      {/* Filtro por sucursal */}
      {showSucursalFilter && (
        <div className="flex-1 min-w-[200px] max-w-[250px]">
          <label htmlFor="sucursal-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1">
            Sucursal
          </label>
          <select
            id="sucursal-filter"
            value={filters.sucursalId || ""}
            onChange={(e) => handleSucursalChange(e.target.value || undefined)}
            className="qoder-dark-input w-full py-2 px-3 text-sm"
            disabled={isLoadingSucursales}
          >
            {isLoadingSucursales ? (
              <option>Cargando sucursales...</option>
            ) : (
              <>
                <option value="">Todas las sucursales</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )}

      {/* Filtro por barbero */}
      {showBarberoFilter && (
        <div className="flex-1 min-w-[200px] max-w-[250px]">
          <label htmlFor="barbero-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1">
            Barbero
          </label>
          <select
            id="barbero-filter"
            value={filters.barberoId || ""}
            onChange={(e) => handleBarberoChange(e.target.value || undefined)}
            className="qoder-dark-input w-full py-2 px-3 text-sm"
            disabled={isLoadingBarberos}
          >
            {isLoadingBarberos ? (
              <option>Cargando barberos...</option>
            ) : (
              <>
                <option value="">Todos los barberos</option>
                {barberosFiltrados?.map((barbero: any) => (
                  <option key={barbero.id_barbero} value={barbero.id_barbero}>
                    {barbero.nombre}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )}

      {/* Filtro por fecha de inicio */}
      {showDateFilters && (
        <div className="flex-1 min-w-[180px] max-w-[220px]">
          <label htmlFor="fecha-inicio-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1">
            Fecha Inicio
          </label>
          <CustomDatePicker
            value={filters.fechaInicio || ""}
            onChange={handleFechaInicioChange}
            placeholder="Seleccionar fecha"
          />
        </div>
      )}

      {/* Filtro por fecha de fin */}
      {showDateFilters && (
        <div className="flex-1 min-w-[180px] max-w-[220px]">
          <label htmlFor="fecha-fin-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1">
            Fecha Fin
          </label>
          <CustomDatePicker
            value={filters.fechaFin || ""}
            onChange={handleFechaFinChange}
            placeholder="Seleccionar fecha"
          />
        </div>
      )}
    </div>
  );
}
