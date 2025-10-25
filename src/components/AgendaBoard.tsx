"use client";

import { useState, useEffect, useMemo } from "react";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useSucursales } from "@/hooks/useSucursales";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal"; // Añadir este import
import { getLocalDateString, getLocalDateTime } from "@/utils/dateUtils"; // Añadir import de utilidades de fecha
import type { Appointment } from "@/types/db";

// Interfaz extendida para citas mapeadas con información adicional
interface MappedAppointment extends Appointment {
  duracionMinutos?: number | null;
}

interface AgendaBoardProps {
  selectedSucursal?: string;
  selectedBarbero?: string;
  onEdit: (appointment: Appointment) => void;
}

export function AgendaBoard({ 
  selectedSucursal, 
  selectedBarbero, 
  onEdit
}: AgendaBoardProps) {
  const { idBarberia, isAdmin, barbero: barberoActual } = useBarberoAuth();
  const { sucursales } = useSucursales(idBarberia || undefined);
  const { data: barberos } = useBarberosList(idBarberia, selectedSucursal);
  const { horarios } = useHorariosSucursales(selectedSucursal);
  const { data: servicios } = useServiciosListPorSucursal(selectedSucursal);
  
  // Obtener horarios de todas las sucursales cuando no hay una seleccionada
  const { horarios: todosLosHorarios } = useHorariosSucursales();
  
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Usar la fecha ajustada a la zona horaria local
    const localDate = getLocalDateTime();
    return localDate;
  });
  
  // Para barberos no administradores, usar su sucursal si no hay una seleccionada
  const sucursalId = selectedSucursal || (barberoActual?.id_sucursal || undefined);
  
  // Para barberos no administradores, usar su ID si no hay uno seleccionado
  const barberoId = selectedBarbero || (barberoActual?.id_barbero && !isAdmin ? barberoActual.id_barbero : undefined);
  
  // Obtener citas para la fecha seleccionada usando la función unificada
  const { data: citas, isLoading } = useCitas(
    sucursalId,
    getLocalDateString(currentDate), // Usar nuestra función unificada
    barberoId
  );

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
    if (!selectedSucursal) return true; // Si no hay sucursal seleccionada, permitir
    
    // Ajustar la fecha para mantener consistencia con dateUtils
    const adjustedDate = new Date(currentDate);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
    const dayOfWeek = adjustedDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    return diasDisponibles.includes(dayOfWeek);
  }, [currentDate, diasDisponibles, selectedSucursal]);

  // Obtener horario combinado de todas las sucursales para el día actual
  const horarioCombinado = useMemo(() => {
    // Solo calcular si no hay una sucursal específica seleccionada
    if (selectedSucursal || !todosLosHorarios || todosLosHorarios.length === 0) return null;
    
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
  }, [todosLosHorarios, selectedSucursal, currentDate]);

  // Generar intervalos de tiempo (cada 30 minutos)
  // NO USADO EN LA VISTA UNIFICADA - Mantenido para compatibilidad
  const timeSlots = useMemo(() => {
    // Siempre requerir una sucursal específica
    if (!selectedSucursal) return [];
    
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
        currentMinute = 0;
        currentHour++;
      }
    }
    
    return slots;
  }, [horarioDelDia, selectedSucursal]);

  // Verificar si un slot está en el horario de almuerzo
  const isLunchTime = (time: string) => {
    // Siempre requerir una sucursal específica
    if (!selectedSucursal) return false;
    
    if (!horarioDelDia || !horarioDelDia.hora_inicio_almuerzo || !horarioDelDia.hora_fin_almuerzo) {
      return false;
    }
    
    const [slotHour, slotMinute] = time.split(':').map(Number);
    const slotTime = slotHour * 60 + slotMinute;
    
    const [lunchStartHour, lunchStartMinute] = horarioDelDia.hora_inicio_almuerzo.split(':').map(Number);
    const [lunchEndHour, lunchEndMinute] = horarioDelDia.hora_fin_almuerzo.split(':').map(Number);
    
    const lunchStartTime = lunchStartHour * 60 + lunchStartMinute;
    const lunchEndTime = lunchEndHour * 60 + lunchEndMinute;
    
    return slotTime >= lunchStartTime && slotTime < lunchEndTime;
  };

  // Mapear citas para reemplazar ID de barbero con nombre y obtener precio correcto del servicio
  const citasMapeadas = useMemo(() => {
    if (!citas || !barberos || !servicios) return [];
    
    return citas.map(cita => {
      // Encontrar el nombre del barbero usando el ID almacenado en el campo barbero
      const barbero = barberos.find(b => b.id_barbero === cita.barbero);
      
      // Encontrar el precio y duración del servicio
      const servicio = servicios.find(s => s.nombre === cita.servicio);
      
      // Obtener la duración como número
      const duracionNumerica = servicio 
        ? servicio.duracion_minutos 
        : (cita.duracion ? parseInt(cita.duracion) : null);
      
      return {
        ...cita,
        // Reemplazar el ID del barbero con su nombre si se encuentra
        barbero: barbero ? barbero.nombre : cita.barbero,
        // Usar el precio del servicio si se encuentra, de lo contrario usar el ticket existente
        ticket: servicio ? servicio.precio : (cita.ticket || 0),
        // Agregar la duración numérica como propiedad adicional
        duracionMinutos: duracionNumerica
      } as Appointment & { duracionMinutos?: number | null };
    });
  }, [citas, barberos, servicios]);
  
  // Obtener citas para cada slot de tiempo y determinar ocupación de slots
  const citasPorHora = useMemo(() => {
    if (!citasMapeadas) return {};
    
    const citasMap: Record<string, (Appointment & { duracionMinutos?: number | null; slotsOcupados?: number })[]> = {};
    
    citasMapeadas.forEach(cita => {
      const hora = cita.hora.slice(0, 5); // Formato HH:MM
      if (!citasMap[hora]) {
        citasMap[hora] = [];
      }
      
      // Calcular cuántos slots ocupa la cita (cada slot es de 30 minutos)
      const duracionMinutos = cita.duracionMinutos || 30;
      const slotsOcupados = Math.ceil(duracionMinutos / 30);
      
      citasMap[hora].push({
        ...cita,
        slotsOcupados
      });
    });
    
    return citasMap;
  }, [citasMapeadas]);
  
  // Crear un mapa de ocupación para saber qué slots están ocupados por citas que se extienden
  const mapaOcupacion = useMemo(() => {
    if (!citasMapeadas) return {};
    
    const ocupacion: Record<string, boolean> = {};
    
    citasMapeadas.forEach(cita => {
      const horaInicio = cita.hora.slice(0, 5); // Formato HH:MM
      const duracionMinutos = cita.duracionMinutos || 30;
      const slotsOcupados = Math.ceil(duracionMinutos / 30);
      
      // Marcar los slots ocupados por esta cita
      const [hora, minuto] = horaInicio.split(':').map(Number);
      
      for (let i = 0; i < slotsOcupados; i++) {
        const minutosTotales = hora * 60 + minuto + (i * 30);
        const horasCalculadas = Math.floor(minutosTotales / 60);
        const minutosCalculados = minutosTotales % 60;
        const slotKey = `${horasCalculadas.toString().padStart(2, '0')}:${minutosCalculados.toString().padStart(2, '0')}`;
        
        // Solo marcar como ocupado si no es el slot inicial (para evitar duplicados)
        if (i > 0) {
          ocupacion[slotKey] = true;
        }
      }
    });
    
    return ocupacion;
  }, [citasMapeadas]);

  // Funciones auxiliares para calcular posiciones y alturas en la vista unificada
  // Basadas en la escala de 64px por 30 minutos (según la memoria de usuario)
  const getPosicionVertical = (hora: string) => {
    if (!horarioDelDia) return 0;
    
    const [horaApertura, minutoApertura] = horarioDelDia.hora_apertura.split(':').map(Number);
    const [horaCita, minutoCita] = hora.split(':').map(Number);
    
    // Calcular minutos desde la apertura
    const minutosDesdeApertura = (horaCita * 60 + minutoCita) - (horaApertura * 60 + minutoApertura);
    
    // 64px por cada 30 minutos (altura base según la memoria)
    return Math.max((minutosDesdeApertura / 30) * 64, 0);
  };
  
  const getAlturaPorDuracion = (duracionMinutos: number | null | undefined) => {
    const duracion = duracionMinutos || 30;
    // 64px por cada 30 minutos (altura base según la memoria)
    return Math.max((duracion / 30) * 64, 64); // Mínimo 64px
  };
  
  const getAlturaEntreHoras = (horaInicio: string, horaFin: string) => {
    const [horaInicioNum, minutoInicioNum] = horaInicio.split(':').map(Number);
    const [horaFinNum, minutoFinNum] = horaFin.split(':').map(Number);
    
    const minutosInicio = horaInicioNum * 60 + minutoInicioNum;
    const minutosFin = horaFinNum * 60 + minutoFinNum;
    
    const diferenciaMinutos = minutosFin - minutosInicio;
    
    // 64px por cada 30 minutos (altura base según la memoria)
    return (diferenciaMinutos / 30) * 64;
  };

  // Navegar a días anteriores/siguientes usando funciones unificadas
  // Solo permitir navegar a días disponibles
  const goToPreviousDay = () => {
    if (!selectedSucursal) {
      // Si no hay sucursal seleccionada, permitir navegación normal
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
      return;
    }
    
    let newDate = new Date(currentDate);
    let attempts = 0;
    const maxAttempts = 7; // Evitar bucle infinito
    
    do {
      newDate.setDate(newDate.getDate() - 1);
      attempts++;
      
      // Ajustar la fecha para mantener consistencia con dateUtils
      const adjustedDate = new Date(newDate);
      adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
      const dayOfWeek = adjustedDate.getDay();
      if (diasDisponibles.includes(dayOfWeek)) {
        setCurrentDate(newDate);
        return;
      }
    } while (attempts < maxAttempts);
    
    // Si no se encuentra un día disponible, mantener la fecha actual
  };

  const goToNextDay = () => {
    if (!selectedSucursal) {
      // Si no hay sucursal seleccionada, permitir navegación normal
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
      return;
    }
    
    let newDate = new Date(currentDate);
    let attempts = 0;
    const maxAttempts = 7; // Evitar bucle infinito
    
    do {
      newDate.setDate(newDate.getDate() + 1);
      attempts++;
      
      // Ajustar la fecha para mantener consistencia con dateUtils
      const adjustedDate = new Date(newDate);
      adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
      const dayOfWeek = adjustedDate.getDay();
      if (diasDisponibles.includes(dayOfWeek)) {
        setCurrentDate(newDate);
        return;
      }
    } while (attempts < maxAttempts);
    
    // Si no se encuentra un día disponible, mantener la fecha actual
  };
  
  // Ir al día de hoy
  const goToToday = () => {
    // Usar la fecha ajustada a la zona horaria local
    const localDate = getLocalDateTime();
    setCurrentDate(localDate);
  };

  // Verificar si se puede navegar hacia atrás o adelante
  const canGoToPreviousDay = useMemo(() => {
    if (!selectedSucursal) return true; // Si no hay sucursal seleccionada, permitir
    
    let newDate = new Date(currentDate);
    let attempts = 0;
    const maxAttempts = 7; // Evitar bucle infinito
    
    do {
      newDate.setDate(newDate.getDate() - 1);
      attempts++;
      
      // Ajustar la fecha para mantener consistencia con dateUtils
      const adjustedDate = new Date(newDate);
      adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
      const dayOfWeek = adjustedDate.getDay();
      if (diasDisponibles.includes(dayOfWeek)) {
        return true;
      }
    } while (attempts < maxAttempts);
    
    return false;
  }, [currentDate, diasDisponibles, selectedSucursal]);
  
  const canGoToNextDay = useMemo(() => {
    if (!selectedSucursal) return true; // Si no hay sucursal seleccionada, permitir
    
    let newDate = new Date(currentDate);
    let attempts = 0;
    const maxAttempts = 7; // Evitar bucle infinito
    
    do {
      newDate.setDate(newDate.getDate() + 1);
      attempts++;
      
      // Ajustar la fecha para mantener consistencia con dateUtils
      const adjustedDate = new Date(newDate);
      adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset() + (-180));
      const dayOfWeek = adjustedDate.getDay();
      if (diasDisponibles.includes(dayOfWeek)) {
        return true;
      }
    } while (attempts < maxAttempts);
    
    return false;
  }, [currentDate, diasDisponibles, selectedSucursal]);

  // Formatear la fecha para mostrar
  const formatDate = (date: Date) => {
    // Usar la función de utilidad para formatear la fecha
    const localDateString = getLocalDateString(date);
    const [year, month, day] = localDateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString('es-UY', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="qoder-dark-card p-4 md:p-6">
      {/* Encabezado con navegación de fechas - responsive */}
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousDay}
            disabled={!canGoToPreviousDay}
            className={`p-2 rounded-full ${canGoToPreviousDay ? 'qoder-dark-button' : 'qoder-dark-button-disabled'}`}
            title="Día anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            onClick={goToToday}
            className="px-2 py-1 rounded-lg qoder-dark-button text-xs font-medium md:px-3 md:py-2 md:text-sm"
          >
            Hoy
          </button>
        </div>
        
        <div className="text-center flex-1 mx-2">
          <h2 className="text-lg font-bold text-qoder-dark-text-primary md:text-2xl">
            {formatDate(currentDate)}
          </h2>
          {!isDiaDisponible && selectedSucursal ? (
            <p className="text-qoder-dark-text-warning text-xs md:text-sm">
              Día no disponible - sin horario configurado
            </p>
          ) : (
            <p className="text-qoder-dark-text-secondary text-xs md:text-sm">
              {citas?.length || 0} citas programadas
            </p>
          )}
        </div>
        
        <button 
          onClick={goToNextDay}
          disabled={!canGoToNextDay}
          className={`p-2 rounded-full ${canGoToNextDay ? 'qoder-dark-button' : 'qoder-dark-button-disabled'}`}
          title="Día siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Tablero de citas - responsive */}
      <div className="overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar md:max-h-[calc(100vh-300px)]">
        <div className="space-y-3 md:space-y-4">
          {selectedSucursal && !isDiaDisponible ? (
            <div className="text-center py-6 md:py-8">
              <p className="text-qoder-dark-text-warning text-sm md:text-base">
                Este día no está disponible para la sucursal seleccionada
              </p>
              <p className="text-qoder-dark-text-secondary text-xs md:text-sm mt-2">
                No hay horario configurado para este día
              </p>
            </div>
          ) : (
            timeSlots.map((time, index) => {
              // Verificar si este slot está ocupado por una cita que se extiende desde un slot anterior
              if (mapaOcupacion[time]) {
                return null; // No mostrar este slot si está ocupado por una cita extendida
              }
              
              const citasEnHora = citasPorHora[time] || [];
              const esHoraAlmuerzo = isLunchTime(time);
              
              return (
                <div 
                  key={time} 
                  className={`flex p-3 rounded-lg border md:p-4 ${
                    esHoraAlmuerzo 
                      ? 'bg-qoder-dark-bg-tertiary border-qoder-dark-border-secondary opacity-70' 
                      : 'bg-qoder-dark-bg-form border-qoder-dark-border-primary'
                  }`}
                >
                  <div className="w-16 flex-shrink-0 md:w-20">
                    <span className={`font-mono text-sm ${esHoraAlmuerzo ? 'text-qoder-dark-text-muted' : 'text-qoder-dark-text-primary'} md:text-base`}>
                      {time}
                    </span>
                    {esHoraAlmuerzo && (
                      <span className="text-xs text-qoder-dark-text-muted block mt-1 md:text-sm">
                        Almuerzo
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 ml-3 md:ml-4">
                    {esHoraAlmuerzo ? (
                      <div className="flex items-center justify-center h-12 md:h-16">
                        <span className="text-qoder-dark-text-muted text-xs md:text-sm">
                          Horario de almuerzo
                        </span>
                      </div>
                    ) : citasEnHora.length > 0 ? (
                      <div className="space-y-2">
                        {citasEnHora.map((cita) => {
                          // Calcular cuántos slots ocupa la cita
                          const slotsOcupados = cita.slotsOcupados || 1;
                          // Calcular la altura basada en slots ocupados (cada slot = 64px aprox)
                          const alturaCalculada = slotsOcupados * 64;
                          
                          return (
                            <div 
                              key={cita.id_cita} 
                              className="qoder-dark-card p-2 hover-lift smooth-transition cursor-pointer overflow-hidden md:p-3"
                              onClick={() => onEdit(cita)}
                              style={{ 
                                height: `${alturaCalculada}px`,
                                minHeight: `${alturaCalculada}px`,
                                marginBottom: '8px',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            >
                              <div className="flex justify-between items-start mb-1 md:mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-qoder-dark-text-primary text-sm truncate md:text-base">
                                    {cita.cliente_nombre}
                                  </h4>
                                  {cita.nota && (
                                    <p className="text-xs text-qoder-dark-text-muted italic truncate mt-1">
                                      {cita.nota}
                                    </p>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-qoder-dark-accent-primary bg-qoder-dark-bg-primary/20 px-1 py-0.5 rounded ml-1 flex-shrink-0 md:text-base md:px-2 md:py-1">
                                  ${cita.ticket || 0}
                                </span>
                              </div>
                              
                              {/* Para citas más cortas, usar layout horizontal */}
                              {alturaCalculada <= 64 ? (
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                  <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium truncate">{cita.hora.slice(0, 5)}</span>
                                  </div>
                                  
                                  <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium truncate">{cita.barbero}</span>
                                  </div>
                                  
                                  <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8v8m0-8h8M8 8H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2M8 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
                                    </svg>
                                    <span className="font-medium truncate">{cita.servicio}</span>
                                  </div>
                                  
                                  {'duracionMinutos' in cita && cita.duracionMinutos !== null && cita.duracionMinutos !== undefined && (
                                    <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="font-medium">{cita.duracionMinutos} min</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                // Para citas más largas, mantener el layout de grid
                                <div className="grid grid-cols-2 gap-1 md:gap-2">
                                  <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium truncate">{cita.hora.slice(0, 5)}</span>
                                  </div>
                                  
                                  <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium truncate">{cita.barbero}</span>
                                  </div>
                                  
                                  <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8v8m0-8h8M8 8H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2M8 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
                                    </svg>
                                    <span className="font-medium truncate">{cita.servicio}</span>
                                  </div>
                                  
                                  {'duracionMinutos' in cita && cita.duracionMinutos !== null && cita.duracionMinutos !== undefined && (
                                    <div className="flex items-center text-qoder-dark-text-secondary text-xs md:text-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-qoder-dark-accent-primary flex-shrink-0 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="font-medium">{cita.duracionMinutos} min</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-12 md:h-16">
                        <span className="text-qoder-dark-text-secondary text-xs md:text-sm">
                          Sin citas
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          
          {timeSlots.length === 0 && (
            <div className="text-center py-6 md:py-8">
              <p className="text-qoder-dark-text-secondary text-sm md:text-base">
                No hay horario configurado para este día
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}