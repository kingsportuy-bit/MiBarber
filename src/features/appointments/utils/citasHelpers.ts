// Funciones auxiliares para el sistema de citas

import type { Appointment } from '@/types/db';

/**
 * Verifica si un slot de tiempo está ocupado considerando la duración del servicio
 */
export function isTimeSlotOccupied(
  hour: number,
  minute: number,
  citasData: Appointment[] | undefined,
  selectedBarberoId: string | undefined,
  fecha: string | undefined,
  duracionReal: number,
  isEdit: boolean = false,
  initialIdCita: string | undefined = undefined
): boolean {
  // Si no hay datos de citas, no marcar como ocupado
  if (!citasData || citasData.length === 0) {
    return false;
  }

  // Convertir a string con formato HH:mm
  const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  // Verificar si hay alguna cita que se solape con este horario
  const occupied = citasData.some((cita: Appointment) => {
    // Solo considerar citas del mismo barbero
    if (cita.id_barbero !== selectedBarberoId) {
      return false;
    }

    // Solo considerar citas de la misma fecha
    if (cita.fecha !== fecha) {
      return false;
    }

    // Si estamos editando una cita, ignorar la propia cita que estamos editando
    if (isEdit && cita.id_cita === initialIdCita) {
      return false;
    }

    // Obtener la hora de la cita
    const citaHora = cita.hora?.slice(0, 5);
    if (!citaHora) return false;

    // Convertir la hora de la cita a minutos desde medianoche
    const [citaHour, citaMinute] = citaHora.split(":").map(Number);
    const citaStartMinutes = citaHour * 60 + citaMinute;
    const citaEndMinutes = citaStartMinutes + (cita.duracion ? parseInt(cita.duracion) : 30);

    // Convertir la hora que estamos verificando a minutos desde medianoche
    const checkMinutes = hour * 60 + minute;
    const checkEndMinutes = checkMinutes + duracionReal;

    // Verificar si hay solapamiento
    // Hay solapamiento si el inicio de uno es menor que el fin del otro y viceversa
    const isOverlapping =
      checkMinutes < citaEndMinutes && checkEndMinutes > citaStartMinutes;
    
    return isOverlapping;
  });

  return occupied;
}

/**
 * Verifica si una fecha está en el pasado
 */
export function isDateInPast(dateString: string): boolean {
  try {
    const today = new Date();
    // Ajustar a la zona horaria local
    today.setMinutes(today.getMinutes() + today.getTimezoneOffset() + (-180));
    
    // Formatear la fecha de hoy como YYYY-MM-DD
    const todayString = today.toISOString().split('T')[0];
    
    // Comparar directamente las cadenas de fecha en formato YYYY-MM-DD
    return dateString < todayString;
  } catch (error) {
    console.error("Error al parsear fecha:", error);
    return true; // Bloquear selección si hay error
  }
}

/**
 * Verifica si una fecha está disponible según los horarios de la sucursal
 */
export function isDateAvailable(
  dateString: string,
  selectedSucursalId: string | undefined,
  horariosSucursal: any[] | undefined
): boolean {
  // Si no hay sucursal seleccionada, permitir todas las fechas
  if (
    !selectedSucursalId ||
    !horariosSucursal ||
    horariosSucursal.length === 0
  ) {
    return true;
  }

  try {
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateString.split("-").map(Number);
    // Crear una fecha en la zona horaria local (ajustando a mediodía para evitar problemas de DST)
    const date = new Date(year, month - 1, day, 12, 0, 0);

    // Obtener el día de la semana (0 = Domingo, 1 = Lunes, etc.)
    const dayOfWeek = date.getDay();

    // Buscar el horario activo para este día
    const horarioActivo = horariosSucursal.find(
      (h) => h.id_dia === dayOfWeek && h.activo
    );

    return !!horarioActivo;
  } catch (error) {
    console.error("Error al verificar disponibilidad de fecha:", error);
    return true; // Permitir selección si hay error
  }
}

/**
 * Obtiene los días deshabilitados según los horarios de la sucursal
 */
export function getDisabledDates(
  selectedSucursalId: string | undefined,
  horariosSucursal: any[] | undefined
): number[] {
  if (!selectedSucursalId || !horariosSucursal || horariosSucursal.length === 0) {
    return [];
  }

  // Obtener los días activos
  const activeDays = horariosSucursal
    .filter(horario => horario.activo)
    .map(horario => horario.id_dia);

  // Crear un array con todos los días de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
  const allDays = [0, 1, 2, 3, 4, 5, 6];
  
  // Encontrar los días inactivos
  const inactiveDays = allDays.filter(day => !activeDays.includes(day));
  
  return inactiveDays;
}