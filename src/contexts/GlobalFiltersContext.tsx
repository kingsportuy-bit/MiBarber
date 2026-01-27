"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberosList } from "@/hooks/useBarberosList";

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
  
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberosList(
    idBarberia || undefined,
    barberoIdFilter
  );

  // Función para obtener las fechas por defecto
  const getDefaultDates = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      fechaInicio: firstDayOfMonth.toISOString().split('T')[0],
      fechaFin: today.toISOString().split('T')[0]
    };
  };

  // Función para validar y corregir fechas
  const validateAndFixDates = (fechaInicio: string | null, fechaFin: string | null) => {
    // Si alguna fecha es null, usar las fechas por defecto
    if (!fechaInicio || !fechaFin) {
      return getDefaultDates();
    }
    
    try {
      const startDate = new Date(fechaInicio);
      const endDate = new Date(fechaFin);
      const today = new Date();
      
      // Limpiar horas para comparación
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      // Si las fechas son futuras, corregirlas
      if (startDate > today) {
        console.warn('Fecha de inicio futura corregida a hoy');
        startDate.setTime(today.getTime());
      }
      if (endDate > today) {
        console.warn('Fecha de fin futura corregida a hoy');
        endDate.setTime(today.getTime());
      }
      
      // Si las fechas están invertidas, corregirlas
      if (startDate > endDate) {
        console.warn('Fechas invertidas corregidas');
        // Intercambiar las fechas
        const temp = new Date(startDate);
        startDate.setTime(endDate.getTime());
        endDate.setTime(temp.getTime());
      }
      
      return {
        fechaInicio: startDate.toISOString().split('T')[0],
        fechaFin: endDate.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error al validar fechas:', error);
      return getDefaultDates();
    }
  };

  // Estado para los filtros globales con validación de fechas
  const [filters, setFilters] = useState<GlobalFilters>(() => {
    // Recuperar filtros del localStorage si existen
    if (typeof window !== "undefined") {
      const savedFilters = localStorage.getItem("globalFilters");
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          
          // Validar y corregir fechas al cargar desde localStorage
          if (parsedFilters.fechaInicio && parsedFilters.fechaFin) {
            const startDate = new Date(parsedFilters.fechaInicio);
            const endDate = new Date(parsedFilters.fechaFin);
            
            // Corregir fechas si están invertidas
            if (startDate > endDate) {
              console.warn('Corrigiendo fechas invertidas al cargar desde localStorage');
              return {
                ...parsedFilters,
                fechaInicio: parsedFilters.fechaFin,
                fechaFin: parsedFilters.fechaInicio
              };
            }
          }
          
          return parsedFilters;
        } catch {
          const defaultDates = getDefaultDates();
          return {
            sucursalId: null,
            barberoId: null,
            fechaInicio: defaultDates.fechaInicio,
            fechaFin: defaultDates.fechaFin
          };
        }
      }
    }
    
    // Valores por defecto con fechas preseleccionadas
    const defaultDates = getDefaultDates();
    return {
      sucursalId: null,
      barberoId: null,
      fechaInicio: defaultDates.fechaInicio,
      fechaFin: defaultDates.fechaFin
    };
  });

  // Función personalizada para actualizar filtros con validación de fechas
  const setFiltersWithValidation = useCallback((newFilters: React.SetStateAction<GlobalFilters>) => {
    setFilters(prev => {
      // Obtener los nuevos filtros
      const nextFilters = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
      
      // Validar y corregir fechas si están invertidas
      if (nextFilters.fechaInicio && nextFilters.fechaFin) {
        const startDate = new Date(nextFilters.fechaInicio);
        const endDate = new Date(nextFilters.fechaFin);
        
        // Si las fechas están invertidas, corregirlas
        if (startDate > endDate) {
          console.warn('Corrigiendo fechas invertidas al actualizar filtros');
          return {
            ...nextFilters,
            fechaInicio: nextFilters.fechaFin,
            fechaFin: nextFilters.fechaInicio
          };
        }
      }
      
      return nextFilters;
    });
  }, []);

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
    if (!defaultFiltersAppliedRef.current && barbero) {
      // Si no somos admin y tenemos un barbero con sucursal, establecerla por defecto
      if (!isAdmin && barbero?.id_sucursal && !filters.sucursalId) {
        setFilters(prev => ({
          ...prev,
          sucursalId: barbero.id_sucursal
        }));
      }
    
      // Si tenemos un barbero logueado y no hay barbero seleccionado, establecer el barberoId por defecto
      // Solo cuando barberoId es undefined (no null que significa "todos los barberos")
      if (barbero?.id_barbero && filters.barberoId === undefined) {
        setFilters(prev => ({
          ...prev,
          barberoId: barbero.id_barbero
        }));
      }
    
      // Para administradores también, si tienen una sucursal asignada, preseleccionarla
      if (isAdmin && barbero?.id_sucursal && !filters.sucursalId) {
        setFilters(prev => ({
          ...prev,
          sucursalId: barbero.id_sucursal
        }));
      }
    
      // Validar y corregir fechas si están invertidas
      setFilters(prev => {
        if (prev.fechaInicio && prev.fechaFin) {
          const startDate = new Date(prev.fechaInicio);
          const endDate = new Date(prev.fechaFin);
          
          // Si las fechas están invertidas, corregirlas
          if (startDate > endDate) {
            return {
              ...prev,
              fechaInicio: prev.fechaFin,
              fechaFin: prev.fechaInicio
            };
          }
        }
        return prev;
      });
    
      // Marcar que los filtros por defecto han sido aplicados
      defaultFiltersAppliedRef.current = true;
    }
    
    // Resetear la bandera cuando cambia el barbero o el rol
    return () => {
      defaultFiltersAppliedRef.current = false;
    };
  }, [barbero?.id_barbero, barbero?.id_sucursal, isAdmin, setFilters, filters.sucursalId, filters.barberoId]);

  // Efecto separado para manejar los filtros de admin
  useEffect(() => {
    // Solo ejecutar una vez por cambio de condición
    if (!adminFiltersAppliedRef.current) {
      // Si tenemos un barbero logueado y no hay barbero seleccionado, establecerlo como filtro
      // Solo cuando barberoId es undefined (no null que significa "todos los barberos")
      if (barbero?.id_barbero && filters.barberoId === undefined) {
        setFilters(prev => ({
          ...prev,
          barberoId: barbero.id_barbero
        }));
        adminFiltersAppliedRef.current = true;
      }
    }
    
    // Resetear la bandera cuando cambia el barbero
    if (!barbero?.id_barbero) {
      adminFiltersAppliedRef.current = false;
    }
  }, [barbero?.id_barbero, setFilters, filters.barberoId]);

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
    const defaultDates = getDefaultDates();
    const newFilters: GlobalFilters = {
      sucursalId: null,
      barberoId: null,
      fechaInicio: defaultDates.fechaInicio,
      fechaFin: defaultDates.fechaFin
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
    setFilters: setFiltersWithValidation, // Usar la versión con validación
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