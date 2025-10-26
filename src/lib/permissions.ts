import type { Barbero } from "@/types/db";

/**
 * Sistema de permisos para MiBarber
 *
 * Tipos de barberos:
 * 1. Owner (nivel_permisos=1, admin=true) - Acceso total
 * 2. Administrator (nivel_permisos=2, admin=true) - Acceso casi total, no puede editar barbería
 * 3. Common barber (nivel_permisos=2, admin=false) - Acceso limitado
 */

export interface PermisosVista {
  // Dashboard
  puedeFiltrarBarberosDashboard: boolean;
  puedeFiltrarSucursalesDashboard: boolean;
  puedeVerTodasLasCitasDashboard: boolean;
  puedeCrearCitasDashboard: boolean;
  puedeEditarCitasAjenasDashboard: boolean;
  puedeEliminarCitasDashboard: boolean;

  // Agenda
  puedeFiltrarBarberosAgenda: boolean;
  puedeFiltrarSucursalesAgenda: boolean;
  puedeVerTodasLasCitasAgenda: boolean;
  puedeCrearCitasAgenda: boolean;
  puedeEditarCitasAjenasAgenda: boolean;
  puedeEliminarCitasAgenda: boolean;

  // Clientes
  puedeVerClientes: boolean;
  puedeFiltrarSucursalesClientes: boolean;
  puedeCrearClientes: boolean;
  puedeEditarClientes: boolean;
  puedeEliminarClientes: boolean;

  // Chats
  puedeVerChats: boolean;
  puedeFiltrarSucursalesChats: boolean;
  puedeResponderChats: boolean;
  puedeTomarControlChats: boolean;

  // Estadísticas
  puedeVerEstadisticas: boolean;
  puedeFiltrarSucursalesEstadisticas: boolean;
  puedeFiltrarBarberosEstadisticas: boolean;
  puedeVerEstadisticasGlobales: boolean;

  // Caja
  puedeVerCaja: boolean;
  puedeFiltrarSucursalesCaja: boolean;
  puedeFiltrarBarberosCaja: boolean;
  puedeVerCajaGlobal: boolean;
  puedeRegistrarPagos: boolean;

  // Mi Barbería
  puedeVerMiBarberia: boolean;
  puedeEditarInfoBarberia: boolean;
  puedeGestionarServicios: boolean;
  puedeGestionarSucursales: boolean;
  puedeGestionarBarberos: boolean;
  puedeGestionarHorarios: boolean;
}

/**
 * Obtiene los permisos basados en el tipo de barbero
 */
export function getPermisos(barbero: Barbero | null): PermisosVista {
  // Si no hay barbero logueado, sin permisos
  if (!barbero) {
    return getPermisosVacios();
  }

  // Owner (nivel_permisos=1, admin=true)
  if (barbero.nivel_permisos === 1 && barbero.admin) {
    return getPermisosOwner();
  }

  // Administrator (nivel_permisos=2, admin=true)
  if (barbero.nivel_permisos === 2 && barbero.admin) {
    return getPermisosAdministrator();
  }

  // Common barber (nivel_permisos=2, admin=false)
  if (barbero.nivel_permisos === 2 && !barbero.admin) {
    return getPermisosCommonBarber();
  }

  // Por defecto, sin permisos
  return getPermisosVacios();
}

/**
 * Permisos vacíos (sin acceso)
 */
function getPermisosVacios(): PermisosVista {
  return {
    // Dashboard
    puedeFiltrarBarberosDashboard: false,
    puedeFiltrarSucursalesDashboard: false,
    puedeVerTodasLasCitasDashboard: false,
    puedeCrearCitasDashboard: false,
    puedeEditarCitasAjenasDashboard: false,
    puedeEliminarCitasDashboard: false,

    // Agenda
    puedeFiltrarBarberosAgenda: false,
    puedeFiltrarSucursalesAgenda: false,
    puedeVerTodasLasCitasAgenda: false,
    puedeCrearCitasAgenda: false,
    puedeEditarCitasAjenasAgenda: false,
    puedeEliminarCitasAgenda: false,

    // Clientes
    puedeVerClientes: false,
    puedeFiltrarSucursalesClientes: false,
    puedeCrearClientes: false,
    puedeEditarClientes: false,
    puedeEliminarClientes: false,

    // Chats
    puedeVerChats: false,
    puedeFiltrarSucursalesChats: false,
    puedeResponderChats: false,
    puedeTomarControlChats: false,

    // Estadísticas
    puedeVerEstadisticas: false,
    puedeFiltrarSucursalesEstadisticas: false,
    puedeFiltrarBarberosEstadisticas: false,
    puedeVerEstadisticasGlobales: false,

    // Caja
    puedeVerCaja: false,
    puedeFiltrarSucursalesCaja: false,
    puedeFiltrarBarberosCaja: false,
    puedeVerCajaGlobal: false,
    puedeRegistrarPagos: false,

    // Mi Barbería
    puedeVerMiBarberia: false,
    puedeEditarInfoBarberia: false,
    puedeGestionarServicios: false,
    puedeGestionarSucursales: false,
    puedeGestionarBarberos: false,
    puedeGestionarHorarios: false,
  };
}

/**
 * Permisos para Owner (acceso total)
 */
function getPermisosOwner(): PermisosVista {
  return {
    // Dashboard - Acceso total
    puedeFiltrarBarberosDashboard: true,
    puedeFiltrarSucursalesDashboard: true,
    puedeVerTodasLasCitasDashboard: true,
    puedeCrearCitasDashboard: true,
    puedeEditarCitasAjenasDashboard: true,
    puedeEliminarCitasDashboard: true,

    // Agenda - Acceso total
    puedeFiltrarBarberosAgenda: true,
    puedeFiltrarSucursalesAgenda: true,
    puedeVerTodasLasCitasAgenda: true,
    puedeCrearCitasAgenda: true,
    puedeEditarCitasAjenasAgenda: true,
    puedeEliminarCitasAgenda: true,

    // Clientes - Acceso total
    puedeVerClientes: true,
    puedeFiltrarSucursalesClientes: true,
    puedeCrearClientes: true,
    puedeEditarClientes: true,
    puedeEliminarClientes: true,

    // Chats - Acceso total
    puedeVerChats: true,
    puedeFiltrarSucursalesChats: true,
    puedeResponderChats: true,
    puedeTomarControlChats: true,

    // Estadísticas - Acceso total
    puedeVerEstadisticas: true,
    puedeFiltrarSucursalesEstadisticas: true,
    puedeFiltrarBarberosEstadisticas: true,
    puedeVerEstadisticasGlobales: true,

    // Caja - Acceso total
    puedeVerCaja: true,
    puedeFiltrarSucursalesCaja: true,
    puedeFiltrarBarberosCaja: true,
    puedeVerCajaGlobal: true,
    puedeRegistrarPagos: true,

    // Mi Barbería - Acceso total
    puedeVerMiBarberia: true,
    puedeEditarInfoBarberia: true,
    puedeGestionarServicios: true,
    puedeGestionarSucursales: true,
    puedeGestionarBarberos: true,
    puedeGestionarHorarios: true,
  };
}

/**
 * Permisos para Administrator (casi todo, excepto editar info de barbería)
 */
function getPermisosAdministrator(): PermisosVista {
  return {
    // Dashboard - Acceso total
    puedeFiltrarBarberosDashboard: true,
    puedeFiltrarSucursalesDashboard: true,
    puedeVerTodasLasCitasDashboard: true,
    puedeCrearCitasDashboard: true,
    puedeEditarCitasAjenasDashboard: true,
    puedeEliminarCitasDashboard: true,

    // Agenda - Acceso total
    puedeFiltrarBarberosAgenda: true,
    puedeFiltrarSucursalesAgenda: true,
    puedeVerTodasLasCitasAgenda: true,
    puedeCrearCitasAgenda: true,
    puedeEditarCitasAjenasAgenda: true,
    puedeEliminarCitasAgenda: true,

    // Clientes - Acceso total
    puedeVerClientes: true,
    puedeFiltrarSucursalesClientes: true,
    puedeCrearClientes: true,
    puedeEditarClientes: true,
    puedeEliminarClientes: true,

    // Chats - Acceso total
    puedeVerChats: true,
    puedeFiltrarSucursalesChats: true,
    puedeResponderChats: true,
    puedeTomarControlChats: true,

    // Estadísticas - Acceso total
    puedeVerEstadisticas: true,
    puedeFiltrarSucursalesEstadisticas: true,
    puedeFiltrarBarberosEstadisticas: true,
    puedeVerEstadisticasGlobales: true,

    // Caja - Acceso total
    puedeVerCaja: true,
    puedeFiltrarSucursalesCaja: true,
    puedeFiltrarBarberosCaja: true,
    puedeVerCajaGlobal: true,
    puedeRegistrarPagos: true,

    // Mi Barbería - Casi todo excepto editar info de barbería
    puedeVerMiBarberia: true,
    puedeEditarInfoBarberia: false, // ❌ NO puede editar info de barbería
    puedeGestionarServicios: true,
    puedeGestionarSucursales: true,
    puedeGestionarBarberos: true,
    puedeGestionarHorarios: true,
  };
}

/**
 * Permisos para Common Barber (acceso limitado)
 */
function getPermisosCommonBarber(): PermisosVista {
  return {
    // Dashboard - Solo sus propias citas
    puedeFiltrarBarberosDashboard: false, // ❌ No puede filtrar por otros barberos
    puedeFiltrarSucursalesDashboard: false, // ❌ No puede filtrar por otras sucursales
    puedeVerTodasLasCitasDashboard: false, // ❌ Solo ve sus citas
    puedeCrearCitasDashboard: true, // ✅ Puede crear citas
    puedeEditarCitasAjenasDashboard: false, // ❌ No puede editar citas de otros
    puedeEliminarCitasDashboard: true, // ✅ Puede eliminar sus propias citas

    // Agenda - Solo sus propias citas
    puedeFiltrarBarberosAgenda: false, // ❌ No puede filtrar por otros barberos
    puedeFiltrarSucursalesAgenda: false, // ❌ No puede filtrar por otras sucursales
    puedeVerTodasLasCitasAgenda: false, // ❌ Solo ve sus citas
    puedeCrearCitasAgenda: true, // ✅ Puede crear citas
    puedeEditarCitasAjenasAgenda: false, // ❌ No puede editar citas de otros
    puedeEliminarCitasAgenda: true, // ✅ Puede eliminar sus propias citas

    // Clientes - Sin acceso
    puedeVerClientes: false, // ❌ No puede ver clientes
    puedeFiltrarSucursalesClientes: false,
    puedeCrearClientes: false,
    puedeEditarClientes: false,
    puedeEliminarClientes: false,

    // Chats - Acceso completo
    puedeVerChats: true, // ✅ Puede ver chats
    puedeFiltrarSucursalesChats: false, // ❌ No puede filtrar por sucursales
    puedeResponderChats: true, // ✅ Puede responder chats
    puedeTomarControlChats: true, // ✅ Puede tomar control de chats

    // Estadísticas - Solo sus propias estadísticas
    puedeVerEstadisticas: true, // ✅ Puede ver estadísticas
    puedeFiltrarSucursalesEstadisticas: false, // ❌ No puede filtrar por sucursales
    puedeFiltrarBarberosEstadisticas: false, // ❌ No puede filtrar por barberos
    puedeVerEstadisticasGlobales: false, // ❌ Solo ve sus estadísticas

    // Caja - Sin acceso
    puedeVerCaja: false, // ❌ No puede ver caja
    puedeFiltrarSucursalesCaja: false,
    puedeFiltrarBarberosCaja: false,
    puedeVerCajaGlobal: false,
    puedeRegistrarPagos: false,

    // Mi Barbería - Sin acceso
    puedeVerMiBarberia: false, // ❌ No puede ver Mi Barbería
    puedeEditarInfoBarberia: false,
    puedeGestionarServicios: false,
    puedeGestionarSucursales: false,
    puedeGestionarBarberos: false,
    puedeGestionarHorarios: false,
  };
}

/**
 * Hook personalizado para usar permisos en componentes
 */
export function usePermisos() {
  // Este hook se puede expandir para integrar con useBarberoAuth
  // Por ahora, simplemente exportamos la función getPermisos
  return { getPermisos };
}
