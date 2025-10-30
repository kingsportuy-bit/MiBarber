import { useState, useEffect } from 'react';
import type { FilterState, TabType } from '@/features/dashboard/types';

export function useDashboardFilters() {
  const [activeTab, setActiveTab] = useState<TabType>('sucursales');
  const [filtroBarbero, setFiltroBarbero] = useState<'todos' | 'porSucursal' | 'individual'>('todos');
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string | null>(null);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  
  // Establecer fechas por defecto
  useEffect(() => {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Formatear fechas como YYYY-MM-DD
    const formatoFecha = (fecha: Date) => fecha.toISOString().split('T')[0];
    
    setFechaDesde(formatoFecha(primerDiaMes));
    setFechaHasta(formatoFecha(hoy));
  }, []);
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  const handleFiltroBarberoChange = (filtro: 'todos' | 'porSucursal' | 'individual') => {
    setFiltroBarbero(filtro);
  };
  
  const handleSucursalChange = (sucursalId: string | null) => {
    setSucursalSeleccionada(sucursalId);
  };
  
  const handleBarberoChange = (barberoId: string | null) => {
    setBarberoSeleccionado(barberoId);
  };
  
  const handleFechaDesdeChange = (fecha: string) => {
    setFechaDesde(fecha);
  };
  
  const handleFechaHastaChange = (fecha: string) => {
    setFechaHasta(fecha);
  };
  
  return {
    // Estado
    activeTab,
    filtroBarbero,
    sucursalSeleccionada,
    barberoSeleccionado,
    fechaDesde,
    fechaHasta,
    
    // Funciones
    handleTabChange,
    handleFiltroBarberoChange,
    handleSucursalChange,
    handleBarberoChange,
    handleFechaDesdeChange,
    handleFechaHastaChange
  };
}