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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
  
  // Para otros formatos, usar el comportamiento original
  return new Intl.DateTimeFormat('es-UY', {
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
  // Primero verificamos si es un array de booleanos en formato JSON
  try {
    // Intentar parsear como JSON
    const diasArray = JSON.parse(diasString);
    
    // Si es un array de booleanos
    if (Array.isArray(diasArray) && diasArray.every(item => typeof item === 'boolean')) {
      // El mapeo es: [lunes, martes, ..., domingo]
      // 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo
      const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const diasSeleccionados = [];
      
      for (let i = 0; i < diasArray.length; i++) {
        if (diasArray[i]) {
          diasSeleccionados.push(dias[i]);
        }
      }
      
      return diasSeleccionados.join(', ');
    }
  } catch (e) {
    // Si no es JSON, continuar con el procesamiento normal
  }
  
  // Procesamiento para formato de índices separados por comas
  // El mapeo es: [lunes, martes, ..., domingo]
  // 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo
  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const numeros = diasString.split(',').map(Number);
  return numeros.map(n => dias[n]).join(', ');
}