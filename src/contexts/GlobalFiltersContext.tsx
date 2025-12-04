"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
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

  // Ref para rastrear si ya se aplicaron los filtros por defecto
  const defaultFiltersAppliedRef = useRef(false);
  // Ref para rastrear si ya se aplicaron los filtros de admin
  const adminFiltersAppliedRef = useRef(false);

  // Efecto para establecer valores por defecto cuando el barbero cambia
  useEffect(() => {
    // Solo ejecutar una vez por cambio de barbero
    if (!defaultFiltersAppliedRef.current) {
      // Si no somos admin y tenemos un barbero con sucursal, establecerla por defecto
      if (!isAdmin && barbero?.id_sucursal) {
        setFilters(prev => ({
          ...prev,
          sucursalId: prev.sucursalId ?? barbero.id_sucursal
        }));
      }
      
      // Si no somos admin y tenemos un barbero, establecer el barberoId por defecto
      if (!isAdmin && barbero?.id_barbero) {
        setFilters(prev => ({
          ...prev,
          barberoId: prev.barberoId ?? barbero.id_barbero
        }));
      }
      
      // Marcar que los filtros por defecto han sido aplicados
      defaultFiltersAppliedRef.current = true;
    }
    
    // Resetear la bandera cuando cambia el barbero o el rol
    return () => {
      defaultFiltersAppliedRef.current = false;
    };
  }, [barbero?.id_barbero, barbero?.id_sucursal, isAdmin, setFilters]);

  // Efecto separado para manejar los filtros de admin
  useEffect(() => {
    // Solo ejecutar una vez por cambio de condición
    if (!adminFiltersAppliedRef.current) {
      // Si somos admin o no tenemos barbero, asegurarnos de que barberoId sea null
      if (isAdmin || !barbero?.id_barbero) {
        setFilters(prev => {
          if (prev.barberoId !== null) {
            return {
              ...prev,
              barberoId: null
            };
          }
          return prev;
        });
        adminFiltersAppliedRef.current = true;
      }
    }
    
    // Resetear la bandera cuando cambia el barbero o el rol
    if ((barbero?.id_barbero && !isAdmin) || (!barbero?.id_barbero)) {
      adminFiltersAppliedRef.current = false;
    }
  }, [barbero?.id_barbero, isAdmin, setFilters]);

  // Efecto para actualizar barberoIdFilter cuando cambia la sucursal
  useEffect(() => {
    if (filters.sucursalId) {
      setBarberoIdFilter(filters.sucursalId);
    } else {
      // Cuando no hay sucursal seleccionada (Todas las sucursales), cargar todos los barberos
      setBarberoIdFilter(undefined);
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
    
    // Establecer valores por defecto nuevamente si tenemos datos
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
    
    // Reiniciar el estado de filtros por defecto aplicados
    defaultFiltersAppliedRef.current = false;
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