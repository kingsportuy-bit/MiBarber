"use client";

import React from "react";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";

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

  const handleSucursalChange = (value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      sucursalId: value || null
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

  // Calcular el número de columnas según los filtros visibles
  const visibleFilters = [
    showSucursalFilter,
    showBarberoFilter,
    showDateFilters
  ].filter(Boolean).length;

  const gridColsClass = visibleFilters > 0 
    ? `grid grid-cols-1 ${visibleFilters >= 2 ? 'md:grid-cols-2' : ''} ${visibleFilters >= 3 ? 'lg:grid-cols-4' : visibleFilters >= 2 ? 'lg:grid-cols-2' : ''} gap-4`
    : 'hidden';

  return (
    <div className={`${gridColsClass} ${className}`}>
      {/* Filtro por sucursal */}
      {showSucursalFilter && (
        <div>
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
        <div>
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
                {barberos?.map((barbero: any) => (
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
        <div>
          <label htmlFor="fecha-inicio-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            id="fecha-inicio-filter"
            value={filters.fechaInicio || ""}
            onChange={(e) => handleFechaInicioChange(e.target.value)}
            className="qoder-dark-input w-full py-2 px-3 text-sm"
          />
        </div>
      )}

      {/* Filtro por fecha de fin */}
      {showDateFilters && (
        <div>
          <label htmlFor="fecha-fin-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            id="fecha-fin-filter"
            value={filters.fechaFin || ""}
            onChange={(e) => handleFechaFinChange(e.target.value)}
            className="qoder-dark-input w-full py-2 px-3 text-sm"
          />
        </div>
      )}
    </div>
  );
}