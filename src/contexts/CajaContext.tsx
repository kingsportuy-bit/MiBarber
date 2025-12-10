"use client";

import { createContext, useContext } from 'react';
import type { 
  MovimientoCaja, 
  FormularioMovimiento, 
  TipoMovimiento, 
  FiltrosCaja,
  EstadisticasCaja,
  RankingBarbero
} from '@/types/caja';
import type { Barbero } from '@/types/db';

interface CajaContextType {
  // Datos
  movimientos: MovimientoCaja[];
  estadisticas?: EstadisticasCaja;
  ranking: MovimientoCaja[];
  barberos: Barbero[];
  filtros: FiltrosCaja;
  tabActivo: TipoMovimiento;
  modalAbierto: boolean;
  movimientoEdicion: MovimientoCaja | null;
  loadingMovimientos: boolean;
  loadingEstadisticas: boolean;
  esAdmin: boolean;
  barbero: any;
  idBarberia: string | null;
  
  // Funciones
  setTabActivo: (tab: TipoMovimiento) => void;
  handleAbrirModal: (movimiento?: MovimientoCaja) => void;
  handleCerrarModal: () => void;
  handleSubmitMovimiento: (datos: FormularioMovimiento) => Promise<void>;
  handleEliminar: (idRegistro: string) => Promise<void>;
  handleFiltroChange: (nuevosFiltros: Partial<FiltrosCaja>) => void;
}

export const CajaContext = createContext<CajaContextType | undefined>(undefined);

export function useCajaContext() {
  const context = useContext(CajaContext);
  if (context === undefined) {
    throw new Error('useCajaContext debe ser usado dentro de un CajaProvider');
  }
  return context;
}