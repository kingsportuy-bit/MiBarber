"use client";

import React from "react";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { CustomSelect } from "@/components/shared/CustomSelect";

interface GlobalFiltersProps {
  className?: string;
  showSucursalFilter?: boolean;
  showBarberoFilter?: boolean;
  showDateFilters?: boolean;
  showAllBarbersOption?: boolean; // Nueva prop para controlar opción "Todos los barberos"
}

export function GlobalFilters({
  className = "",
  showSucursalFilter = false,
  showBarberoFilter = true,
  showDateFilters = false,
  showAllBarbersOption = false // Por defecto false para mantener comportamiento actual
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

  // Mostrar indicador de carga si aún no tenemos datos
  if (isLoadingSucursales || isLoadingBarberos) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-qoder-dark-text-secondary text-sm">
          Cargando filtros...
        </div>
      </div>
    );
  }

  // Filtrar barberos por sucursal seleccionada (redundante por DB filter, pero por las dudas usamos igualdad no estricta)
  const barberosFiltrados = filters.sucursalId
    ? barberos?.filter((b: any) => String(b.id_sucursal) === String(filters.sucursalId))
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
          <CustomSelect
            value={filters.sucursalId || ""}
            onValueChange={(value) => handleSucursalChange(value || undefined)}
            options={[
              { value: "", label: "Todas las sucursales" },
              ...(sucursales?.map((s) => ({
                value: String(s.id),
                label: s.nombre_sucursal || `Sucursal ${s.numero_sucursal}`
              })) || [])
            ]}
            disabled={isLoadingSucursales}
            placeholder={isLoadingSucursales ? "Cargando sucursales..." : "Todas las sucursales"}
          />
        </div>
      )}

      {/* Filtro por barbero */}
      {showBarberoFilter && (
        <div className="flex-1 min-w-[200px] max-w-[250px]">
          <label htmlFor="barbero-filter" className="block text-xs font-medium text-qoder-dark-text-primary mb-1">
            Barbero
          </label>
          <CustomSelect
            value={filters.barberoId || ""}
            onValueChange={(value) => handleBarberoChange(value || undefined)}
            options={[
              ...(showAllBarbersOption ? [{ value: "", label: "Todos los barberos" }] : []),
              ...(barberosFiltrados?.map((b: any) => ({
                value: String(b.id_barbero),
                label: b.nombre
              })) || [])
            ]}
            disabled={isLoadingBarberos}
            placeholder={isLoadingBarberos ? "Cargando barberos..." : "Seleccionar barbero"}
          />
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
