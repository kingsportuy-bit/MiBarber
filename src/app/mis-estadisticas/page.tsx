"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useEstadisticas } from "@/hooks/useEstadisticas";
import { EstadisticasFiltros } from "@/hooks/useEstadisticas";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { EstadisticasKPIs } from "@/components/EstadisticasKPIs";
import { ResumenEjecutivo } from "@/components/ResumenEjecutivo";
import { TendenciasNegocio } from "@/components/TendenciasNegocio";
import { ComparativaNegocio } from "@/components/ComparativaNegocio";

export default function MisEstadisticasPage() {
  const { barbero, isLoading: isLoadingAuth } = useBarberoAuth();
  
  // Mover los hooks al inicio del componente, antes de cualquier retorno condicional
  const [filtros, setFiltros] = useState<EstadisticasFiltros>({
    desde: "",
    hasta: "",
    barbero: "",
    servicio: ""
  });
  
  // Mover los hooks al inicio del componente, antes de cualquier retorno condicional
  const { data: citasData, kpis: estadisticasKPIs, isLoading: isLoadingEstadisticasData } = useEstadisticas(filtros);
  const isLoadingData = isLoadingAuth || isLoadingEstadisticasData;
  
  // Verificar si el usuario es administrador
  const esAdmin = barbero?.admin || false;
  
  // Establecer fechas por defecto al cargar la página
  useEffect(() => {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Formatear fechas como YYYY-MM-DD
    const formatoFecha = (fecha: Date) => {
      return fecha.toISOString().split('T')[0];
    };
    
    setFiltros(prev => ({
      ...prev,
      desde: formatoFecha(primerDiaMes),
      hasta: formatoFecha(hoy),
      barbero: barbero?.id_barbero || ""
    }));
  }, [barbero?.id_barbero]);
  
  // Si no hay barbero o no es admin, mostrar mensaje apropiado
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qoder-dark-accent-primary mx-auto mb-4"></div>
          <p className="text-qoder-dark-text-secondary">
            Cargando información del usuario...
          </p>
        </div>
      </div>
    );
  }
  
  if (!barbero) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-2">
            Acceso Restringido
          </h2>
          <p className="text-qoder-dark-text-secondary">
            Debes iniciar sesión para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }
  
  if (!esAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-2">
            Acceso Restringido
          </h2>
          <p className="text-qoder-dark-text-secondary">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }
  
  // Función para manejar cambios en los filtros
  const handleFiltroChange = (campo: string, valor: string) => {
    // Para barberos normales, no permitir cambiar el filtro de barbero
    if (campo === "barbero") {
      return;
    }
    
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };
  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Formatear fechas como YYYY-MM-DD
    const formatoFecha = (fecha: Date) => {
      return fecha.toISOString().split('T')[0];
    };
    
    setFiltros({
      desde: formatoFecha(primerDiaMes),
      hasta: formatoFecha(hoy),
      barbero: barbero?.id_barbero || "",
      servicio: ""
    });
  };
  
  return (
    <>
      <Head>
        <title>MiBarber | Mis Estadísticas</title>
      </Head>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-qoder-dark-text-primary">Mis Estadísticas</h2>
        </div>
        
        {/* Filtros */}
        <div className="qoder-dark-card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-qoder-dark-text-secondary mb-1">Desde</label>
              <CustomDatePicker
                value={filtros.desde}
                onChange={(date) => setFiltros(prev => ({ ...prev, desde: date }))}
                placeholder="Desde"
              />
            </div>
            
            <div>
              <label className="block text-sm text-qoder-dark-text-secondary mb-1">Hasta</label>
              <CustomDatePicker
                value={filtros.hasta}
                onChange={(date) => setFiltros(prev => ({ ...prev, hasta: date }))}
                placeholder="Hasta"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={limpiarFiltros}
                className="qoder-dark-button-secondary px-4 py-2 rounded flex-1"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
        
        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qoder-dark-accent-primary"></div>
          </div>
        ) : estadisticasKPIs ? (
          <div className="space-y-6">
            {/* KPIs principales */}
            <EstadisticasKPIs estadisticas={estadisticasKPIs} />
            
            {/* Resumen ejecutivo visual */}
            <ResumenEjecutivo estadisticas={estadisticasKPIs} />
            
            {/* Tendencias del negocio */}
            <TendenciasNegocio estadisticas={estadisticasKPIs} />
            
            {/* Comparativa de negocio */}
            <ComparativaNegocio estadisticas={estadisticasKPIs} />
          </div>
        ) : (
          <div className="qoder-dark-card p-6 text-center">
            <p className="text-qoder-dark-text-secondary">
              No se pudieron cargar las estadísticas
            </p>
          </div>
        )}
      </div>
    </>
  );
}