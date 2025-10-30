// Test básico para verificar que el hook se exporta correctamente
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

// Verificación de que el hook se puede importar
console.log('useDashboardData importado correctamente:', typeof useDashboardData === 'function');