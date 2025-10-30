/**
 * Utilidades para manejo de fechas consistentes en toda la aplicación
 * Ajustado para zona horaria local (UTC-3 para Uruguay)
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD ajustada a la zona horaria local (UTC-3 para Uruguay)
 * Esta función debe ser utilizada en toda la aplicación para mantener consistencia
 */
export function getLocalDateString(date?: Date): string {
  const now = date || new Date();
  // Ajustar manualmente a UTC-3 (Uruguay)
  now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + (-180));
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la fecha y hora actual ajustada a la zona horaria local (UTC-3 para Uruguay)
 */
export function getLocalDateTime(): Date {
  const now = new Date();
  // Ajustar manualmente a UTC-3 (Uruguay)
  now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + (-180));
  return now;
}

/**
 * Convierte una fecha ISO string a formato YYYY-MM-DD ajustado a la zona horaria local (UTC-3 para Uruguay)
 */
export function convertISOToLocalDate(isoString: string): string {
  const date = new Date(isoString);
  // Ajustar manualmente a UTC-3 (Uruguay)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + (-180));
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el día de la semana para una fecha dada (0 = Domingo, 1 = Lunes, etc.)
 * Ajustado para zona horaria local (UTC-3 para Uruguay)
 */
export function getDayOfWeek(dateString: string): number {
  // Crear fecha sin considerar la hora para evitar problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day); // Mes es 0-indexado en Date
  
  // Ajustar manualmente a UTC-3 (Uruguay)
  localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset() + (-180));
  
  return localDate.getDay();
}

/**
 * Convierte el día de la semana de JavaScript al ID de día en la base de datos
 * JavaScript: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
 * Base de datos: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
 */
export function convertJsDayToDbDay(jsDay: number): number {
  // Ahora JavaScript y la base de datos usan el mismo esquema, así que no es necesario convertir
  return jsDay;
}

/**
 * Compara dos fechas (YYYY-MM-DD) para determinar si una es anterior a la otra
 */
export function isDateBefore(date1: string, date2: string): boolean {
  // Crear fechas sin considerar la hora para comparar solo las fechas
  const [year1, month1, day1] = date1.split('-').map(Number);
  const [year2, month2, day2] = date2.split('-').map(Number);
  
  const d1 = new Date(year1, month1 - 1, day1);
  const d2 = new Date(year2, month2 - 1, day2);
  
  // Ajustar manualmente a UTC-3 (Uruguay)
  d1.setMinutes(d1.getMinutes() + d1.getTimezoneOffset() + (-180));
  d2.setMinutes(d2.getMinutes() + d2.getTimezoneOffset() + (-180));
  
  return d1 < d2;
}

/**
 * Compara dos fechas (YYYY-MM-DD) para determinar si una es igual a la otra
 */
export function isDateEqual(date1: string, date2: string): boolean {
  // Crear fechas sin considerar la hora para comparar solo las fechas
  const [year1, month1, day1] = date1.split('-').map(Number);
  const [year2, month2, day2] = date2.split('-').map(Number);
  
  const d1 = new Date(year1, month1 - 1, day1);
  const d2 = new Date(year2, month2 - 1, day2);
  
  // Ajustar manualmente a UTC-3 (Uruguay)
  d1.setMinutes(d1.getMinutes() + d1.getTimezoneOffset() + (-180));
  d2.setMinutes(d2.getMinutes() + d2.getTimezoneOffset() + (-180));
  
  return d1.getTime() === d2.getTime();
}

/**
 * Formatea una fecha para mostrarla en la interfaz
 * Ejemplo: "Lunes, 23 de octubre"
 */
export function formatDisplayDate(dateString: string): string {
  // Crear fecha sin considerar la hora para evitar problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day); // Mes es 0-indexado en Date
  
  // Ajustar manualmente a UTC-3 (Uruguay)
  localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset() + (-180));
  
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const dayOfWeek = days[localDate.getDay()];
  const dayOfMonth = localDate.getDate();
  const monthName = months[localDate.getMonth()];
  
  return `${dayOfWeek}, ${dayOfMonth} de ${monthName}`;
}

/**
 * Navega a un día anterior
 */
export function getPreviousDay(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  
  // Ajustar manualmente a UTC-3 (Uruguay)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + (-180));
  
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  
  return `${newYear}-${newMonth}-${newDay}`;
}

/**
 * Navega a un día siguiente
 */
export function getNextDay(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);
  
  // Ajustar manualmente a UTC-3 (Uruguay)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + (-180));
  
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  
  return `${newYear}-${newMonth}-${newDay}`;
}