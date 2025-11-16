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
  // Si no hay sucursal seleccionada (Todas las sucursales), mostrar todos los barberos
  // Si hay una sucursal seleccionada, mostrar solo los barberos de esa sucursal
  const barberosFiltrados = filters.sucursalId 
    ? barberos?.filter((b: any) => b.id_sucursal === filters.sucursalId)
    : barberos;

  const handleSucursalChange = (value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      sucursalId: value || null,
      // Resetear el filtro de barbero cuando cambia la sucursal
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

  // Calcular el número de columnas según los filtros visibles
  const visibleFilters = [
    showSucursalFilter,
    showBarberoFilter,
    showDateFilters
  ].filter(Boolean).length;

  const gridColsClass = visibleFilters > 0 
    ? `grid grid-cols-1 ${visibleFilters >= 2 ? 'md:grid-cols-2' : ''} ${visibleFilters >= 3 ? 'lg:grid-cols-4' : visibleFilters >= 2 ? 'lg:grid-cols-2' : ''} gap-4 w-full`
    : 'hidden';

  return (
    <div className={`${gridColsClass} ${className}`}>
      {/* Filtro por sucursal */}
      {showSucursalFilter && (
        <div className="w-full">
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
        <div className="w-full">
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
        <div>
          <label htmlFor="fecha-inicio-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1">
            Fecha Inicio
          </label>
          <div className="w-full">
            <CustomDatePicker
              value={filters.fechaInicio || ""}
              onChange={handleFechaInicioChange}
              placeholder="Seleccionar fecha"
            />
          </div>
        </div>
      )}

      {/* Filtro por fecha de fin */}
      {showDateFilters && (
        <div>
          <label htmlFor="fecha-fin-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1">
            Fecha Fin
          </label>
          <div className="w-full">
            <CustomDatePicker
              value={filters.fechaFin || ""}
              onChange={handleFechaFinChange}
              placeholder="Seleccionar fecha"
            />
          </div>
        </div>
      )}
    </div>
  );
}