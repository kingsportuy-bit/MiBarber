import { useEffect, useMemo } from 'react';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';

/**
 * Custom hook para gestionar los filtros de la agenda
 * Centraliza toda la lógica de filtros en un solo lugar
 * 
 * @returns {Object} Objeto con filtros, funciones y estado
 */
export function useAgendaFilters() {
  const {
    filters,
    setFilters,
    sucursales,
    barberos,
    isLoadingSucursales,
    isLoadingBarberos,
    isAdmin,
    barbero
  } = useGlobalFilters();

  // ========================================
  // INICIALIZACIÓN AUTOMÁTICA DE FILTROS
  // ========================================
  useEffect(() => {
    // No hacer nada si no hay barbero logueado
    if (!barbero) {
      console.log('⏸️ No hay barbero logueado, no preseleccionar');
      return;
    }

    // No hacer nada si aún están cargando datos
    if (isLoadingSucursales || isLoadingBarberos) {
      console.log('⏸️ Aún cargando datos, esperando...');
      return;
    }

    // No hacer nada si no hay sucursales disponibles
    if (!sucursales || sucursales.length === 0) {
      console.log('⏸️ No hay sucursales disponibles');
      return;
    }

    const needsSucursal = !filters.sucursalId;
    const needsBarbero = !filters.barberoId; // ✅ REMOVIDO check de isAdmin

    // Si no necesita actualizar nada, salir
    if (!needsSucursal && !needsBarbero) {
      console.log('✅ Filtros ya están establecidos:', { sucursalId: filters.sucursalId, barberoId: filters.barberoId });
      return;
    }

    const newFilters = { ...filters };
    let shouldUpdate = false;

    // ========================================
    // PRESELECCIONAR SUCURSAL
    // ========================================
    if (needsSucursal) {
      // Caso 1: Solo hay una sucursal → seleccionarla automáticamente
      if (sucursales.length === 1) {
        newFilters.sucursalId = sucursales[0].id;
        shouldUpdate = true;
        console.log('🏢 Preseleccionando única sucursal:', sucursales[0].nombre_sucursal || sucursales[0].id);
      }
      // Caso 2: Barbero no-admin con sucursal asignada → usar su sucursal
      else if (!isAdmin && barbero.id_sucursal) {
        newFilters.sucursalId = barbero.id_sucursal;
        shouldUpdate = true;
        console.log('🏢 Preseleccionando sucursal del barbero:', barbero.id_sucursal);
      }
      // Caso 3: Admin con múltiples sucursales pero tiene sucursal asignada
      else if (isAdmin && barbero.id_sucursal) {
        newFilters.sucursalId = barbero.id_sucursal;
        shouldUpdate = true;
        console.log('🏢 Preseleccionando sucursal del admin:', barbero.id_sucursal);
      }
      // Caso 4: Admin con múltiples sucursales sin asignación
      else {
        console.log('ℹ️ Admin con múltiples sucursales - esperar selección manual');
      }
    }

    // ========================================
    // PRESELECCIONAR BARBERO (admins Y no-admins)
    // ========================================
    if (needsBarbero && barbero.id_barbero) {
      newFilters.barberoId = barbero.id_barbero;
      shouldUpdate = true;
      console.log('👤 Preseleccionando barbero logueado:', barbero.nombre, isAdmin ? '(admin)' : '(barbero normal)');
    }

    // Aplicar cambios si es necesario
    if (shouldUpdate) {
      console.log('✅ Actualizando filtros:', newFilters);
      setFilters(newFilters);
    }
  }, [
    // Dependencias principales
    barbero,
    isAdmin,
    isLoadingSucursales,
    isLoadingBarberos,
    sucursales,
    barberos,
    filters.sucursalId,
    filters.barberoId,
    setFilters,
  ]);

  // ========================================
  // FILTRAR BARBEROS POR SUCURSAL
  // ========================================
  const filteredBarbers = useMemo(() => {
    // Si no hay sucursal seleccionada, mostrar todos los barberos
    if (!filters.sucursalId) {
      console.log('📋 Mostrando todos los barberos (sin filtro de sucursal)');
      return barberos || [];
    }

    // Filtrar solo barberos de la sucursal seleccionada
    const filtered = barberos?.filter((b: any) => b.id_sucursal === filters.sucursalId) || [];
    console.log(`📋 Barberos filtrados por sucursal ${filters.sucursalId}:`, filtered.length);
    return filtered;
  }, [filters.sucursalId, barberos]);

  // ========================================
  // VALIDAR QUE LOS FILTROS ESTÉN LISTOS
  // ========================================
  const isReady = useMemo(() => {
    // Usar la misma lógica que citasParams: filtros O datos del barbero
    const sucursalId = filters.sucursalId || barbero?.id_sucursal;
    const ready = !!sucursalId;

    console.log('🎯 Filtros listos para consultar:', ready, {
      sucursalId: filters.sucursalId,
      barberoSucursal: barbero?.id_sucursal,
      final: sucursalId
    });
    return ready;
  }, [filters.sucursalId, barbero?.id_sucursal]);

  // ========================================
  // PARÁMETROS PARA useCitas
  // ========================================
  const citasParams = useMemo(() => {
    // CAMBIO CRÍTICO: En lugar de esperar a que filters esté listo,
    // usar INMEDIATAMENTE los datos del barbero como hace /inicio (KanbanBoard)
    // Esto asegura que siempre haya params válidos para consultar

    const sucursalId = filters.sucursalId || barbero?.id_sucursal || undefined;
    const barberoId = filters.barberoId || barbero?.id_barbero || undefined;

    // Solo requerimos sucursalId para hacer la consulta
    if (!sucursalId) {
      console.log('⏸️ No hay sucursalId disponible (ni en filters ni en barbero)');
      return undefined;
    }

    const params = {
      sucursalId,
      barberoId,
    };

    console.log('📡 Parámetros para useCitas:', params, {
      fromFilters: { sucursalId: filters.sucursalId, barberoId: filters.barberoId },
      fromBarbero: { sucursalId: barbero?.id_sucursal, barberoId: barbero?.id_barbero },
      final: params
    });
    return params;
  }, [filters.sucursalId, filters.barberoId, barbero?.id_sucursal, barbero?.id_barbero]);

  // ========================================
  // HANDLERS PARA CAMBIAR FILTROS
  // ========================================
  const handleSucursalChange = (value: string | undefined) => {
    console.log('🔄 Cambiando sucursal a:', value);
    setFilters(prev => ({
      ...prev,
      sucursalId: value || null,
      barberoId: null, // Resetear barbero cuando cambia la sucursal
    }));
  };

  const handleBarberoChange = (value: string | undefined) => {
    console.log('🔄 Cambiando barbero a:', value);
    setFilters(prev => ({
      ...prev,
      barberoId: value || null,
    }));
  };

  // ========================================
  // RETORNAR API DEL HOOK
  // ========================================
  return {
    // Estado de filtros
    filters,
    setFilters,

    // Datos de opciones
    sucursales,
    barberos: filteredBarbers, // Ya filtrados por sucursal

    // Estados de carga
    isLoadingSucursales,
    isLoadingBarberos,

    // Información del usuario
    isAdmin,
    barbero,

    // Validación y parámetros
    isReady,
    citasParams,

    // Handlers
    handleSucursalChange,
    handleBarberoChange,
  };
}
