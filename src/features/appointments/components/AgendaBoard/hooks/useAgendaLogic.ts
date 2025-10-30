import { useState, useEffect, useMemo, useCallback } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useBarberos } from "@/hooks/useBarberos";
import { useSucursales } from "@/hooks/useSucursales";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { getLocalDateString, getLocalDateTime } from "@/utils/dateUtils";
import { useCitasList } from '@/features/appointments/hooks/useCitasList';
import type { Appointment } from "@/types/db";

interface MappedAppointment extends Appointment {
  duracionMinutos?: number | null;
}

interface UseAgendaLogicProps {
  selectedSucursal?: string;
  selectedBarbero?: string;
}

export function useAgendaLogic({ 
  selectedSucursal, 
  selectedBarbero 
}: UseAgendaLogicProps) {
  const { idBarberia, isAdmin, barbero: barberoActual, refreshSession, isAuthenticated } = useBarberoAuth();
  const { sucursales } = useSucursales(idBarberia || undefined);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  // 🔐 REGLAS DE SEGURIDAD - CRÍTICO
  // Validar que la sesión esté activa
  const isSessionValid = isAuthenticated && idBarberia && barberoActual;
  
  // id_barberia SIEMPRE de la sesión (NUNCA puede cambiar)
  const barberiaSegura = idBarberia; // SIEMPRE usar de sesión

  // id_sucursal depende del nivel de permisos:
  // - Admin: puede cambiar entre sucursales de SU barbería
  // - Barbero común: FIJO de su sesión
  const sucursalSegura = isAdmin
    ? (selectedSucursal || barberoActual?.id_sucursal || undefined) // Admin puede cambiar
    : (barberoActual?.id_sucursal || undefined); // Barbero común: FIJO

  // USAR barberiaSegura y sucursalSegura en TODAS las queries
  const { data: barberos } = useBarberos(sucursalSegura); // ✅ Usar solo sucursalSegura

  const { horarios } = useHorariosSucursales(sucursalSegura);
  const { data: servicios } = useServiciosListPorSucursal(sucursalSegura);
  
  // Obtener horarios de todas las sucursales cuando no hay una seleccionada
  const { horarios: todosLosHorarios } = useHorariosSucursales();
  
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Usar la fecha ajustada a la zona horaria local
    const localDate = getLocalDateTime();
    return localDate;
  });
  
  // Para barberos no administradores, usar su sucursal si no hay una seleccionada
  const sucursalId = sucursalSegura || (barberoActual?.id_sucursal || undefined);
  
  // Para barberos no administradores, usar su ID si no hay uno seleccionado
  const barberoId = selectedBarbero || (barberoActual?.id_barbero && !isAdmin ? barberoActual.id_barbero : undefined);
  
  // Obtener citas para la fecha seleccionada usando el mismo mecanismo que el tablero de turnos
  const { data: citas = [], isLoading } = useCitas({
    sucursalId: sucursalId,
    fecha: getLocalDateString(currentDate), // Usar nuestra función unificada
    barberoId: barberoId
  });
  
  console.log("Parámetros de búsqueda de citas:", { sucursalId, fecha: getLocalDateString(currentDate), barberoId });
  console.log("Citas cargadas:", citas);

  // Obtener horario de la sucursal para el día actual
  const horarioDelDia = useMemo(() => {
    if (!horarios || horarios.length === 0) return null;
    
    // Ajustar la fecha para mantener consistencia con dateUtils
    const adjustedDate = new Date(currentDate);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
    const dayOfWeek = adjustedDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const diaId = dayOfWeek; // Ahora usamos el mismo esquema
    
    return horarios.find(h => h.id_dia === diaId && h.activo);
  }, [horarios, currentDate]);
  
  // Determinar qué días están disponibles según los horarios de la sucursal
  const diasDisponibles = useMemo(() => {
    if (!horarios || horarios.length === 0) return [];
    
    // Crear un array con todos los días de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    
    // Encontrar los días que tienen horarios activos
    const activeDays = horarios
      .filter(horario => horario.activo)
      .map(horario => {
        // Ahora JavaScript y la base de datos usan el mismo esquema:
        // 0=Domingo, 1=Lunes, 2=Martes, ..., 6=Sábado
        return horario.id_dia;
      });
    
    return activeDays;
  }, [horarios]);
  
  // Verificar si el día actual está disponible
  const isDiaDisponible = useMemo(() => {
    if (!sucursalSegura) return true; // Si no hay sucursal seleccionada, permitir
    
    // Ajustar la fecha para mantener consistencia con dateUtils
    const adjustedDate = new Date(currentDate);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
    const dayOfWeek = adjustedDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    return diasDisponibles.includes(dayOfWeek);
  }, [currentDate, diasDisponibles, sucursalSegura]);

  // Obtener horario combinado de todas las sucursales para el día actual
  const horarioCombinado = useMemo(() => {
    // Solo calcular si no hay una sucursal específica seleccionada
    if (sucursalSegura || !todosLosHorarios || todosLosHorarios.length === 0) return null;
    
    // Ajustar la fecha para mantener consistencia con dateUtils
    const adjustedDate = new Date(currentDate);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
    const dayOfWeek = adjustedDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const diaId = dayOfWeek; // Ahora usamos el mismo esquema
    
    // Filtrar horarios activos para el día actual
    const horariosDelDia = todosLosHorarios
      .filter(h => h.id_dia === diaId && h.activo);
    
    if (horariosDelDia.length === 0) return null;
    
    // Encontrar la hora de apertura más temprana y la hora de cierre más tardía
    let horaAperturaMin = 24; // Inicializar con el valor máximo
    let minutoAperturaMin = 59;
    let horaCierreMax = 0; // Inicializar con el valor mínimo
    let minutoCierreMax = 0;
    
    horariosDelDia.forEach(horario => {
      const [horaApertura, minutoApertura] = horario.hora_apertura.split(':').map(Number);
      const [horaCierre, minutoCierre] = horario.hora_cierre.split(':').map(Number);
      
      // Verificar hora de apertura más temprana
      if (horaApertura < horaAperturaMin || 
          (horaApertura === horaAperturaMin && minutoApertura < minutoAperturaMin)) {
        horaAperturaMin = horaApertura;
        minutoAperturaMin = minutoApertura;
      }
      
      // Verificar hora de cierre más tardía
      if (horaCierre > horaCierreMax || 
          (horaCierre === horaCierreMax && minutoCierre > minutoCierreMax)) {
        horaCierreMax = horaCierre;
        minutoCierreMax = minutoCierre;
      }
    });
    
    return {
      hora_apertura: `${horaAperturaMin.toString().padStart(2, '0')}:${minutoAperturaMin.toString().padStart(2, '0')}`,
      hora_cierre: `${horaCierreMax.toString().padStart(2, '0')}:${minutoCierreMax.toString().padStart(2, '0')}`
    };
  }, [todosLosHorarios, sucursalSegura, currentDate]);

  // Generar intervalos de tiempo (cada 30 minutos)
  // NO USADO EN LA VISTA UNIFICADA - Mantenido para compatibilidad
  const timeSlots = useMemo(() => {
    // Siempre requerir una sucursal específica
    if (!sucursalSegura) return [];
    
    // Si no hay horario configurado, mostrar mensaje
    if (!horarioDelDia) return [];
    
    // Si hay horario configurado, generar slots según el horario
    const slots = [];
    const [horaApertura, minutoApertura] = horarioDelDia.hora_apertura.split(':').map(Number);
    const [horaCierre, minutoCierre] = horarioDelDia.hora_cierre.split(':').map(Number);
    
    let currentHour = horaApertura;
    let currentMinute = minutoApertura;
    
    while (currentHour < horaCierre || (currentHour === horaCierre && currentMinute < minutoCierre)) {
      slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
      
      // Incrementar 30 minutos
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour += 1;
      }
    }
    
    return slots;
  }, [horarioDelDia, sucursalSegura]);

  // Mapear citas a formato de agenda
  const citasMapeadas = useMemo(() => {
    if (!citas) return [];
    
    return citas.map((cita: Appointment) => {
      // Calcular duración en minutos si existe
      let duracionMinutos = null;
      
      // Si la cita tiene duración, extraer los minutos
      if (cita.duracion) {
        // Extraer solo los números de la duración (ej: "60m" -> 60)
        const match = cita.duracion.match(/(\d+)/);
        if (match) {
          duracionMinutos = parseInt(match[1], 10);
        }
      }
      
      // Calcular cuántos slots de 30 minutos ocupa la cita
      let slotsOcupados = 1;
      if (duracionMinutos && duracionMinutos > 0) {
        slotsOcupados = Math.ceil(duracionMinutos / 30);
      }
      
      return {
        ...cita,
        duracionMinutos,
        slotsOcupados
      };
    });
  }, [citas]);

  // Agrupar citas por hora para la vista de lista
  const citasPorHora = useMemo(() => {
    if (!citasMapeadas) return {};
    
    const grouped: Record<string, MappedAppointment[]> = {};
    
    citasMapeadas.forEach((cita: MappedAppointment) => {
      const hora = cita.hora.split(':')[0]; // Obtener solo la hora
      if (!grouped[hora]) {
        grouped[hora] = [];
      }
      grouped[hora].push(cita);
    });
    
    return grouped;
  }, [citasMapeadas]);

  // Crear mapa de ocupación para visualización
  const mapaOcupacion = useMemo(() => {
    if (!citasMapeadas) return {};
    
    const ocupacion: Record<string, boolean> = {};
    
    citasMapeadas.forEach((cita: MappedAppointment) => {
      const [hora, minuto] = cita.hora.split(':').map(Number);
      const key = `${hora}:${minuto.toString().padStart(2, '0')}`;
      ocupacion[key] = true;
    });
    
    return ocupacion;
  }, [citasMapeadas]);

  // Calcular límites de navegación
  const canGoToPreviousDay = useMemo(() => {
    // Siempre permitir ir al día anterior
    return true;
  }, []);

  const canGoToNextDay = useMemo(() => {
    // Siempre permitir ir al día siguiente
    return true;
  }, []);

  // Handlers de navegación
  const goToPreviousDay = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(getLocalDateTime());
  }, []);

  // Funciones auxiliares
  const isLunchTime = useCallback((time: string) => {
    if (!horarioDelDia || !horarioDelDia.hora_inicio_almuerzo || !horarioDelDia.hora_fin_almuerzo) {
      return false;
    }
    
    const [hora, minuto] = time.split(':').map(Number);
    const currentTime = hora * 60 + minuto;
    
    const [inicioHora, inicioMinuto] = horarioDelDia.hora_inicio_almuerzo.split(':').map(Number);
    const inicioTime = inicioHora * 60 + inicioMinuto;
    
    const [finHora, finMinuto] = horarioDelDia.hora_fin_almuerzo.split(':').map(Number);
    const finTime = finHora * 60 + finMinuto;
    
    return currentTime >= inicioTime && currentTime < finTime;
  }, [horarioDelDia]);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const getPosicionVertical = useCallback((time: string) => {
    if (!horarioDelDia) return 0;
    
    const [hora, minuto] = time.split(':').map(Number);
    const currentTime = hora * 60 + minuto;
    
    const [aperturaHora, aperturaMinuto] = horarioDelDia.hora_apertura.split(':').map(Number);
    const aperturaTime = aperturaHora * 60 + aperturaMinuto;
    
    const minutosTranscurridos = currentTime - aperturaTime;
    return minutosTranscurridos;
  }, [horarioDelDia]);

  const getAlturaPorDuracion = useCallback((duracionMinutos: number) => {
    return duracionMinutos;
  }, []);

  const getAlturaEntreHoras = useCallback(() => {
    return 60; // 60 minutos por hora
  }, []);

  // Si la sesión no es válida, intentar refrescarla
  useEffect(() => {
    if (!isSessionValid && !hasTriedRefresh) {
      console.warn('⚠️ SESIÓN NO VÁLIDA - INTENTANDO REFRESCAR');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('idBarberia:', idBarberia);
      console.log('barberoActual:', barberoActual);
      
      refreshSession();
      setHasTriedRefresh(true);
    }
  }, [isSessionValid, hasTriedRefresh, isAuthenticated, idBarberia, barberoActual, refreshSession]);

  // Si la sesión no es válida después de intentar refrescarla, retornar estado vacío
  if (!isSessionValid && hasTriedRefresh) {
    console.error('❌ SESIÓN NO VÁLIDA - FALTAN DATOS CRÍTICOS');
    return {
      // Estados
      currentDate: new Date(),
      setCurrentDate: () => {},
      isLoading: true,
      sucursalId: undefined,
      barberoId: undefined,
      
      // Contexto
      isAdmin: false,
      barberiaSegura: null,
      sucursalSegura: null,
      
      // Datos computados
      horarioDelDia: null,
      diasDisponibles: [],
      isDiaDisponible: true,
      horarioCombinado: null,
      timeSlots: [],
      citasMapeadas: [],
      citasPorHora: {},
      mapaOcupacion: {},
      canGoToPreviousDay: false,
      canGoToNextDay: false,
      
      // Datos de contexto
      sucursales: [],
      barberos: [],
      servicios: [],
      horarios: [],
      todosLosHorarios: [],
      citas: [],
      
      // Handlers
      goToPreviousDay: () => {},
      goToNextDay: () => {},
      goToToday: () => {},
      
      // Funciones auxiliares
      isLunchTime: () => false,
      formatDate: () => '',
      getPosicionVertical: () => 0,
      getAlturaPorDuracion: () => 0,
      getAlturaEntreHoras: () => 0,
    };
  }

  // Si la sesión no es válida y aún no hemos intentado refrescar, retornar estado de carga
  if (!isSessionValid && !hasTriedRefresh) {
    return {
      // Estados
      currentDate: new Date(),
      setCurrentDate: () => {},
      isLoading: true,
      sucursalId: undefined,
      barberoId: undefined,
      
      // Contexto
      isAdmin: false,
      barberiaSegura: null,
      sucursalSegura: null,
      
      // Datos computados
      horarioDelDia: null,
      diasDisponibles: [],
      isDiaDisponible: true,
      horarioCombinado: null,
      timeSlots: [],
      citasMapeadas: [],
      citasPorHora: {},
      mapaOcupacion: {},
      canGoToPreviousDay: false,
      canGoToNextDay: false,
      
      // Datos de contexto
      sucursales: [],
      barberos: [],
      servicios: [],
      horarios: [],
      todosLosHorarios: [],
      citas: [],
      
      // Handlers
      goToPreviousDay: () => {},
      goToNextDay: () => {},
      goToToday: () => {},
      
      // Funciones auxiliares
      isLunchTime: () => false,
      formatDate: () => '',
      getPosicionVertical: () => 0,
      getAlturaPorDuracion: () => 0,
      getAlturaEntreHoras: () => 0,
    };
  }

  // Retornar todos los datos cuando la sesión es válida
  return {
    // Estados
    currentDate,
    setCurrentDate,
    isLoading,
    sucursalId,
    barberoId,
    
    // Contexto
    isAdmin,
    barberiaSegura,
    sucursalSegura,
    
    // Datos computados
    horarioDelDia,
    diasDisponibles,
    isDiaDisponible,
    horarioCombinado,
    timeSlots,
    citasMapeadas,
    citasPorHora,
    mapaOcupacion,
    canGoToPreviousDay,
    canGoToNextDay,
    
    // Datos de contexto
    sucursales,
    barberos,
    servicios,
    horarios,
    todosLosHorarios,
    citas,
    
    // Handlers
    goToPreviousDay,
    goToNextDay,
    goToToday,
    
    // Funciones auxiliares
    isLunchTime,
    formatDate,
    getPosicionVertical,
    getAlturaPorDuracion,
    getAlturaEntreHoras,
  };
}