"use client";

import { useState, useRef } from "react";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useEstadisticas } from "@/hooks/useEstadisticas";
import { BarberoStatsView } from "@/components/BarberoStatsView";
import { AdminStatsView } from "@/components/AdminStatsView";
import { ExportarEstadisticas } from "@/components/ExportarEstadisticas";
import { ExportarEstadisticasCompleto } from "@/components/ExportarEstadisticasCompleto";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EstadisticasPage() {
  usePageTitle("Barberox | Panel de Estadísticas");
  
  const { isAuthenticated, isAdmin, barbero } = useBarberoAuth();
  const router = useRouter();
  const [periodo, setPeriodo] = useState<"diario" | "semanal" | "mensual" | "trimestral" | "anual">("mensual");
  
  // Redirigir a barberos normales
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      router.push("/agenda");
    }
  }, [isAuthenticated, isAdmin, router]);
  
  // Obtener datos para exportación
  const { barberoStats, adminStats } = useEstadisticas({ 
    periodo, 
    barberoId: barbero?.id_barbero 
  });
  
  const exportData = isAdmin ? adminStats.data : barberoStats.data;
  const filename = isAdmin ? `estadisticas-admin-${periodo}` : `estadisticas-barbero-${barbero?.nombre}-${periodo}`;

  // Mostrar mensaje de carga
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-2">
            Cargando...
          </h2>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de acceso denegado para barberos normales
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-2">
            Acceso Restringido
          </h2>
          <p className="text-qoder-dark-text-secondary">
            Solo los administradores pueden acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-qoder-dark-text-primary">
          Panel de Estadísticas
        </h1>
        
        <div className="flex gap-2 items-center">
          {exportData && (
            <ExportarEstadisticas data={exportData} filename={filename} />
          )}
        </div>
      </div>

      {isAdmin ? (
        <AdminStatsView periodo={periodo} />
      ) : (
        <BarberoStatsView 
          barberoId={barbero?.id_barbero || ""} 
          periodo={periodo} 
        />
      )}
    </div>
  );
}