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
 * Compara dos fechas ignorando la hora y ajustando a la zona horaria local
 * Devuelve true si las fechas representan el mismo día
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  // Ajustar ambas fechas a UTC-3 (Uruguay)
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
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

/**
 * Obtiene el primer día del mes actual
 */
export function getFirstDayOfMonth(): string {
  const now = new Date();
  // Ajustar manualmente a UTC-3 (Uruguay)
  now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + (-180));
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = '01';
  
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el último día del mes actual
 */
export function getLastDayOfMonth(): string {
  const now = new Date();
  // Ajustar manualmente a UTC-3 (Uruguay)
  now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + (-180));
  
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // Mes siguiente
  // Crear fecha del primer día del mes siguiente y restar un día
  const lastDayDate = new Date(year, month, 0); // 0 da el último día del mes anterior
  
  const lastYear = lastDayDate.getFullYear();
  const lastMonth = String(lastDayDate.getMonth() + 1).padStart(2, '0');
  const lastDay = String(lastDayDate.getDate()).padStart(2, '0');
  
  return `${lastYear}-${lastMonth}-${lastDay}`;
}