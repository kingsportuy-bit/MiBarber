// lib/horarioUtils.ts
// Funciones auxiliares para cálculo de horarios

/**
 * Convierte minutos a formato HH:MM
 */
export function minutosAHora(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Convierte HH:MM a minutos desde las 00:00
 */
export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Genera un array de horas disponibles en intervalos de 15 minutos
 */
export function generarIntervalosTiempos(horaInicio: string, horaFin: string): string[] {
  const minInicio = horaAMinutos(horaInicio);
  const minFin = horaAMinutos(horaFin);
  const intervalos: string[] = [];

  for (let i = minInicio; i < minFin; i += 15) {
    intervalos.push(minutosAHora(i));
  }

  return intervalos;
}

/**
 * Obtiene el día de la semana (0=Domingo, 1=Lunes... 6=Sábado)
 */
export function obtenerDiaDelaFecha(fecha: string): number {
  // La fecha viene en formato YYYY-MM-DD
  // Necesitamos asegurarnos de que se interprete correctamente en la zona horaria local
  // En lugar de new Date(fecha), usamos una forma que preserve el día
  
  // Parsear la fecha manualmente
  const [year, month, day] = fecha.split('-').map(Number);
  // Crear una fecha en la zona horaria local (ajustando a mediodía para evitar problemas de DST)
  const date = new Date(year, month - 1, day, 12, 0, 0);
  
  // 0=Domingo, 1=Lunes... 6=Sábado
  return date.getDay();
}

/**
 * Convierte el índice de descanso extra (0=Lunes) a día de semana JS (0=Domingo)
 */
export function convertirDescansoADiaJS(indiceDia: number): number {
  // índice: 0=Lunes, 1=Martes... 6=Domingo
  // Convertir a día JS: 0=Domingo, 1=Lunes... 6=Sábado
  return indiceDia === 6 ? 0 : indiceDia + 1;
}

/**
 * Chequea si una hora está ocupada por una cita considerando la duración
 */
export function estaOcupadoPorCita(
  horaConsulta: string,
  citaHora: string,
  citaDuracion: number
): boolean {
  const minConsulta = horaAMinutos(horaConsulta);
  const minCita = horaAMinutos(citaHora);
  const minCitaFin = minCita + citaDuracion;

  // Si la consulta comienza durante la cita
  return minConsulta >= minCita && minConsulta < minCitaFin;
}

/**
 * Chequea si una hora está en el rango bloqueado
 */
export function estaOcupadoPorBloqueo(
  horaConsulta: string,
  bloqInicio: string | null,
  bloqFin: string | null
): boolean {
  if (!bloqInicio || !bloqFin) return false;

  const minConsulta = horaAMinutos(horaConsulta);
  const minInicio = horaAMinutos(bloqInicio);
  const minFin = horaAMinutos(bloqFin);

  return minConsulta >= minInicio && minConsulta < minFin;
}

/**
 * Chequea si una hora está en descanso extra recurrente
 */
export function estaEnDescansoExtra(
  horaConsulta: string,
  descansoInicio: string,
  descansoFin: string
): boolean {
  const minConsulta = horaAMinutos(horaConsulta);
  const minInicio = horaAMinutos(descansoInicio);
  const minFin = horaAMinutos(descansoFin);

  return minConsulta >= minInicio && minConsulta < minFin;
}

/**
 * Chequea si una hora está en almuerzo
 */
export function estaEnAlmuerzo(
  horaConsulta: string,
  almuerzoInicio: string | null,
  almuerzoFin: string | null
): boolean {
  if (!almuerzoInicio || !almuerzoFin) return false;

  const minConsulta = horaAMinutos(horaConsulta);
  const minInicio = horaAMinutos(almuerzoInicio);
  const minFin = horaAMinutos(almuerzoFin);

  return minConsulta >= minInicio && minConsulta < minFin;
}