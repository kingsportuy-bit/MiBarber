"use client";

import { useDashboardFilters } from "@/features/dashboard/hooks/useDashboardFilters";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { SucursalesTab } from "@/features/dashboard/components/tabs/SucursalesTab";
import { BarberosTab } from "@/features/dashboard/components/tabs/BarberosTab";
import { ClientesTab } from "@/features/dashboard/components/tabs/ClientesTab";

interface DashboardContainerProps {
  periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
}

export function DashboardContainer({ periodo }: DashboardContainerProps) {
  // Hooks de estado y datos
  const {
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
  } = useDashboardFilters();
  
  const { idBarberia, isAdmin, barbero: barberoActual } = useBarberoAuth();
  
  // 🔐 REGLAS DE SEGURIDAD - CRÍTICO
  // id_barberia SIEMPRE de la sesión (NUNCA puede cambiar)
  const barberiaSegura = idBarberia; // SIEMPRE usar de sesión

  // id_sucursal depende del nivel de permisos:
  // - Admin: puede cambiar entre sucursales de SU barbería
  // - Barbero común: NO debería estar aquí (solo admins acceden al dashboard)
  const sucursalSegura = isAdmin
    ? (sucursalSeleccionada || barberoActual?.id_sucursal || null) // Admin puede cambiar
    : (barberoActual?.id_sucursal || null); // Barbero común: FIJO (fallback)
  
  const {
    adminStats,
    isLoading,
    error
  } = useDashboardData({
    periodo,
    activeTab,
    sucursalSeleccionada: sucursalSegura, // Usar sucursalSegura en lugar de sucursalSeleccionada
    barberoSeleccionado,
    fechaDesde,
    fechaHasta
  });
  
  // Manejo de estados de carga y error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-qoder-dark-text-primary mb-2">
            Error al cargar estadísticas
          </h3>
          <p className="text-qoder-dark-text-secondary">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }
  
  if (!adminStats.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-qoder-dark-text-primary">
            No hay datos disponibles
          </h3>
        </div>
      </div>
    );
  }
  
  const stats = adminStats.data;

  return (
    <div className="p-6 rounded-lg" style={{ background: 'var(--qoder-dark-bg-quaternary)' }}>
      {/* Pestañas estilo navegador Chrome */}
      <div className="flex overflow-x-auto pb-1 -mb-1">
        <button
          className={`py-2 px-4 font-medium text-sm rounded-t-lg mr-1 relative transition-all duration-200 ${
            activeTab === "sucursales"
              ? "text-qoder-dark-accent-primary bg-qoder-dark-bg-secondary border-x border-t border-qoder-dark-border-primary z-10"
              : "text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary bg-qoder-dark-bg-tertiary hover:bg-qoder-dark-bg-secondary border border-transparent"
          }`}
          style={{
            clipPath: activeTab === "sucursales" 
              ? "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)" 
              : "polygon(0 0, calc(100% - 8px) 0, calc(100% - 2px) 100%, 0 100%)"
          }}
          onClick={() => handleTabChange("sucursales")}
        >
          <div className="flex items-center">
            <span>Sucursales</span>
          </div>
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm rounded-t-lg mr-1 relative transition-all duration-200 ${
            activeTab === "barberos"
              ? "text-qoder-dark-accent-primary bg-qoder-dark-bg-secondary border-x border-t border-qoder-dark-border-primary z-10"
              : "text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary bg-qoder-dark-bg-tertiary hover:bg-qoder-dark-bg-secondary border border-transparent"
          }`}
          style={{
            clipPath: activeTab === "barberos" 
              ? "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)" 
              : "polygon(0 0, calc(100% - 8px) 0, calc(100% - 2px) 100%, 0 100%)"
          }}
          onClick={() => handleTabChange("barberos")}
        >
          <div className="flex items-center">
            <span>Barberos</span>
          </div>
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm rounded-t-lg mr-1 relative transition-all duration-200 ${
            activeTab === "clientes"
              ? "text-qoder-dark-accent-primary bg-qoder-dark-bg-secondary border-x border-t border-qoder-dark-border-primary z-10"
              : "text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary bg-qoder-dark-bg-tertiary hover:bg-qoder-dark-bg-secondary border border-transparent"
          }`}
          style={{
            clipPath: activeTab === "clientes" 
              ? "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)" 
              : "polygon(0 0, calc(100% - 8px) 0, calc(100% - 2px) 100%, 0 100%)"
          }}
          onClick={() => handleTabChange("clientes")}
        >
          <div className="flex items-center">
            <span>Clientes</span>
          </div>
        </button>
        <div className="flex-grow border-b border-qoder-dark-border-primary"></div>
      </div>
      
      {/* Contenido de las pestañas */}
      {activeTab === "sucursales" && (
        <SucursalesTab
          stats={stats}
          sucursalSeleccionada={sucursalSegura} // Usar sucursalSegura en lugar de sucursalSeleccionada
          onSucursalChange={handleSucursalChange}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          onFechaDesdeChange={handleFechaDesdeChange}
          onFechaHastaChange={handleFechaHastaChange}
        />
      )}
      
      {activeTab === "barberos" && (
        <BarberosTab
          stats={stats}
          filtroBarbero={filtroBarbero}
          onFiltroBarberoChange={handleFiltroBarberoChange}
          sucursalSeleccionada={sucursalSegura} // Usar sucursalSegura en lugar de sucursalSeleccionada
          onSucursalChange={handleSucursalChange}
          barberoSeleccionado={barberoSeleccionado}
          onBarberoChange={handleBarberoChange}
        />
      )}
      
      {activeTab === "clientes" && (
        <ClientesTab
          stats={stats}
        />
      )}
    </div>
  );
}