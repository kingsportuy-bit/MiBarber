import { useEstadisticasAdmin } from '@/hooks/useEstadisticas';
import { useBarberoAuth } from '@/hooks/useBarberoAuth';
import type { AdminEstadisticas } from '@/hooks/useEstadisticas';
import type { TabType } from '@/features/dashboard/types';

interface UseDashboardDataProps {
  periodo: "diario" | "semanal" | "mensual" | "trimestral" | "anual";
  activeTab: TabType;
  sucursalSeleccionada: string | null;
  barberoSeleccionado: string | null;
  fechaDesde: string;
  fechaHasta: string;
}

export function useDashboardData({
  periodo,
  activeTab,
  sucursalSeleccionada,
  barberoSeleccionado,
  fechaDesde,
  fechaHasta
}: UseDashboardDataProps) {
  const { idBarberia, isAdmin, barbero: barberoActual } = useBarberoAuth();
  
  // 🔐 REGLAS DE SEGURIDAD - CRÍTICO
  // Validar que la sesión esté activa
  if (!idBarberia || !barberoActual) {
    console.error('❌ SESIÓN NO VÁLIDA - FALTAN DATOS CRÍTICOS');
    console.log('idBarberia:', idBarberia);
    console.log('barberoActual:', barberoActual);
    // Podríamos redirigir al login aquí si fuera necesario
  }
  
  // id_barberia SIEMPRE de la sesión (NUNCA puede cambiar)
  const barberiaSegura = idBarberia; // SIEMPRE usar de sesión

  // id_sucursal depende del nivel de permisos:
  // - Admin: puede cambiar entre sucursales de SU barbería
  // - Barbero común: NO debería estar aquí (solo admins acceden al dashboard)
  const sucursalSegura = isAdmin
    ? (sucursalSeleccionada || barberoActual?.id_sucursal || null) // Admin puede cambiar
    : (barberoActual?.id_sucursal || null); // Barbero común: FIJO (fallback)

  // Usar el hook de estadísticas de administrador
  const adminStatsQuery = useEstadisticasAdmin({ 
    periodo,
    sucursalId: activeTab === "sucursales" && sucursalSegura ? sucursalSegura : undefined,
    fechaDesde: activeTab === "sucursales" ? fechaDesde : undefined,
    fechaHasta: activeTab === "sucursales" ? fechaHasta : undefined
  });
  
  // Transformar datos para widgets y gráficos
  const transformDataForCharts = (stats: AdminEstadisticas | undefined) => {
    if (!stats) return {
      ingresosPorSucursalData: [],
      ingresosPorBarberoData: [],
      ingresosPorServicioData: [],
      turnosPorHoraData: [],
      productividadBarberoData: [],
      serviciosRentablesData: [],
      distribucionClientesData: [],
      ingresosTendenciaData: []
    };
    
    // Preparar datos para las gráficas
    const ingresosPorSucursalData = Object.entries(stats.ingresosPorSucursal)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor);
      
    const ingresosPorBarberoData = Object.entries(stats.ingresosPorBarbero)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
      
    const ingresosPorServicioData = Object.entries(stats.ingresosPorServicio)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
      
    const turnosPorHoraData = Object.entries(stats.turnosPorHora)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor);
      
    const productividadBarberoData = Object.entries(stats.productividadBarbero)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
      
    // Datos para gráficas de torta
    const serviciosRentablesData = Object.entries(stats.serviciosRentables)
      .map(([nombre, valor], index) => ({
        nombre,
        valor,
        color: ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"][index]
      }));
      
    const distribucionClientesData = Object.entries(stats.distribucionClientes)
      .map(([nombre, valor], index) => ({
        nombre,
        valor,
        color: ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"][index]
      }));
      
    // Datos para tendencia de ingresos
    const ingresosTendenciaData = Object.entries(stats.ingresosTendencia)
      .map(([fecha, valor]) => ({ fecha, valor }));
      
    return {
      ingresosPorSucursalData,
      ingresosPorBarberoData,
      ingresosPorServicioData,
      turnosPorHoraData,
      productividadBarberoData,
      serviciosRentablesData,
      distribucionClientesData,
      ingresosTendenciaData
    };
  };
  
  const chartData = transformDataForCharts(adminStatsQuery.adminStats.data);
  
  return {
    adminStats: adminStatsQuery.adminStats,
    chartData,
    isLoading: adminStatsQuery.adminStats.isLoading,
    error: adminStatsQuery.adminStats.error
  };
}