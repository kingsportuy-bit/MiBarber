"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberos } from "@/hooks/useBarberos";

// Definir tipos para los filtros globales
export interface GlobalFilters {
  sucursalId: string | null;
  barberoId: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
}

// Definir el tipo para el contexto
interface GlobalFiltersContextType {
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  sucursales: any[];
  barberos: any[];
  isLoadingSucursales: boolean;
  isLoadingBarberos: boolean;
  resetFilters: () => void;
  isAdmin: boolean;
  barbero: any;
}

// Crear el contexto
const GlobalFiltersContext = createContext<GlobalFiltersContextType | undefined>(undefined);

// Proveedor del contexto
export function GlobalFiltersProvider({ children }: { children: ReactNode }) {
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const { sucursales, isLoading: isLoadingSucursales } = useSucursales(idBarberia || undefined);
  const [barberoIdFilter, setBarberoIdFilter] = useState<string | undefined>(undefined);
  
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberos(
    barberoIdFilter
  );

  // Estado para los filtros globales
  const [filters, setFilters] = useState<GlobalFilters>(() => {
    // Recuperar filtros del localStorage si existen
    if (typeof window !== "undefined") {
      const savedFilters = localStorage.getItem("globalFilters");
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters);
        } catch {
          return {
            sucursalId: null,
            barberoId: null,
            fechaInicio: null,
            fechaFin: null
          };
        }
      }
    }
    
    return {
      sucursalId: null,
      barberoId: null,
      fechaInicio: null,
      fechaFin: null
    };
  });

  // Efecto para guardar filtros en localStorage cuando cambian
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("globalFilters", JSON.stringify(filters));
    }
  }, [filters]);

  // Efecto para establecer la sucursal por defecto - solo una vez cuando se cargan las sucursales
  useEffect(() => {
    if (sucursales && sucursales.length > 0 && !filters.sucursalId) {
      // Para barberos normales, seleccionar automáticamente su sucursal
      if (!isAdmin && barbero?.id_sucursal) {
        setFilters(prev => ({
          ...prev,
          sucursalId: barbero.id_sucursal
        }));
        setBarberoIdFilter(barbero.id_sucursal);
      } else if (isAdmin && sucursales[0]) {
        // Para administradores, seleccionar la primera sucursal por defecto
        setFilters(prev => ({
          ...prev,
          sucursalId: sucursales[0].id
        }));
        setBarberoIdFilter(sucursales[0].id);
      }
    }
  }, [sucursales, isAdmin, barbero?.id_sucursal, filters.sucursalId]); // Añadido filters.sucursalId y sucursales como dependencias

  // Efecto para establecer el barbero por defecto - solo para barberos normales
  useEffect(() => {
    if (!isAdmin && barbero?.id_barbero && !filters.barberoId) {
      setFilters(prev => ({
        ...prev,
        barberoId: barbero.id_barbero
      }));
    }
  }, [barbero?.id_barbero, isAdmin, filters.barberoId]); // Añadido filters.barberoId como dependencia

  // Efecto para actualizar barberoIdFilter cuando cambia la sucursal
  useEffect(() => {
    if (filters.sucursalId) {
      setBarberoIdFilter(filters.sucursalId);
    }
  }, [filters.sucursalId]);

  // Función para resetear filtros
  const resetFilters = () => {
    const newFilters: GlobalFilters = {
      sucursalId: null,
      barberoId: null,
      fechaInicio: null,
      fechaFin: null
    };
    
    // Establecer valores por defecto nuevamente
    if (sucursales && sucursales.length > 0) {
      if (!isAdmin && barbero?.id_sucursal) {
        newFilters.sucursalId = barbero.id_sucursal;
      } else if (isAdmin && sucursales[0]) {
        newFilters.sucursalId = sucursales[0].id;
      }
    }
    
    if (!isAdmin && barbero?.id_barbero) {
      newFilters.barberoId = barbero.id_barbero;
    }
    
    setFilters(newFilters);
  };

  // Valor del contexto
  const contextValue: GlobalFiltersContextType = {
    filters,
    setFilters,
    sucursales: sucursales || [],
    barberos: barberos || [],
    isLoadingSucursales,
    isLoadingBarberos,
    resetFilters,
    isAdmin,
    barbero
  };

  return (
    <GlobalFiltersContext.Provider value={contextValue}>
      {children}
    </GlobalFiltersContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useGlobalFilters() {
  const context = useContext(GlobalFiltersContext);
  if (context === undefined) {
    throw new Error("useGlobalFilters debe ser usado dentro de un GlobalFiltersProvider");
  }
  return context;
}