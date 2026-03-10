import { getLocalDateString } from '@/shared/utils/dateUtils';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatHours(hours: number): string {
  return `${hours.toFixed(1)}h`
}

export function formatDate(dateString: string): string {
  // Si ya está en formato YYYY-MM-DD, parsear manualmente para evitar problemas de zona horaria
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Mes es 0-indexado
    return new Intl.DateTimeFormat('es-UY', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  // Para otros formatos, usar el comportamiento original
  return new Intl.DateTimeFormat('es-UY', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function formatTime(timeString: string): string {
  // timeString en formato HH:MM
  return timeString
}

export function diasSemanaNombres(diasString: string): string {
  if (!diasString) return '';

  try {
    // Si viene como string '0,1,2'
    const diasArray = diasString.split(',').map(d => d.trim());
    const diasCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    // Verificamos si son números del 0 al 6
    if (diasArray.every(d => !isNaN(Number(d)) && Number(d) >= 0 && Number(d) <= 6)) {
      return diasArray.map(d => diasCortos[Number(d)]).join(', ');
    }

    // Comportamiento anterior para arrays booleanos en JSON
    const parsedArray = JSON.parse(diasString);
    if (Array.isArray(parsedArray) && parsedArray.every(item => typeof item === 'boolean')) {
      const diasCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const diasActivos = parsedArray
        .map((activo, index) => activo ? diasCortos[index] : null)
        .filter(Boolean) as string[];
      return diasActivos.join(', ');
    }
  } catch (e) {
    // Si falla el parseo, continuar
  }

  // Si no es un array de booleanos ni números, devolvemos el string original
  return diasString;
}