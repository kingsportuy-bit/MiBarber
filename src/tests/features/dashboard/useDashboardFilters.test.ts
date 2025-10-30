// Test básico para verificar que el hook se exporta correctamente
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters';

// Verificación de que el hook se puede importar
console.log('useDashboardFilters importado correctamente:', typeof useDashboardFilters === 'function');