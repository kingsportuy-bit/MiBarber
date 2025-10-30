// Hook para acceder a los filtros globales
import { useGlobalFilters as useGlobalFiltersContext } from "@/contexts/GlobalFiltersContext";

export function useGlobalFilters() {
  const context = useGlobalFiltersContext();
  
  // Retornar solo lo necesario para las páginas
  return {
    filters: context.filters,
    setFilters: context.setFilters,
    sucursales: context.sucursales,
    barberos: context.barberos,
    isLoadingSucursales: context.isLoadingSucursales,
    isLoadingBarberos: context.isLoadingBarberos,
    resetFilters: context.resetFilters,
    isAdmin: context.isAdmin,
    barbero: context.barbero
  };
}