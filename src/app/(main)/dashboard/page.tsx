"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useGlobalFilters } from "@/hooks/useGlobalFilters";
import { GlobalFilters } from "@/components/shared/GlobalFilters";

export default function DashboardPage() {
  usePageTitle("Barberox | Dashboard");
  
  const { filters, isAdmin } = useGlobalFilters();

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-qoder-dark-text-primary">
          Dashboard
        </h1>
      </div>
      
      {/* Filtros globales - solo visibles para administradores */}
      {isAdmin && <GlobalFilters className="mb-6" />}
      
      {/* Contenido del dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="qoder-dark-window p-6">
          <h2 className="text-lg font-semibold mb-4">Resumen</h2>
          <p className="text-qoder-dark-text-secondary">
            Sucursal seleccionada: {filters.sucursalId || "Ninguna"}
          </p>
          <p className="text-qoder-dark-text-secondary">
            Barbero seleccionado: {filters.barberoId || "Ninguno"}
          </p>
          <p className="text-qoder-dark-text-secondary">
            Fecha inicio: {filters.fechaInicio || "No especificada"}
          </p>
          <p className="text-qoder-dark-text-secondary">
            Fecha fin: {filters.fechaFin || "No especificada"}
          </p>
        </div>
        
        <div className="qoder-dark-window p-6">
          <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
          <p className="text-qoder-dark-text-secondary">
            Aquí se mostrarían las estadísticas según los filtros seleccionados.
          </p>
        </div>
        
        <div className="qoder-dark-window p-6">
          <h2 className="text-lg font-semibold mb-4">Próximas citas</h2>
          <p className="text-qoder-dark-text-secondary">
            Aquí se mostrarían las próximas citas según los filtros seleccionados.
          </p>
        </div>
      </div>
    </div>
  );
}