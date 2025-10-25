export function formatWhatsAppTimestamp(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  
  // Calcular diferencia en días
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const sameDay = d.toDateString() === now.toDateString();
  
  if (sameDay) {
    // Solo hora si es el mismo día
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays <= 7) {
    // Hora - Día de la semana si es dentro de la última semana
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const day = d.toLocaleDateString([], { weekday: "long" });
    // Capitalizar primera letra del día
    const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
    return `${time} - ${capitalizedDay}`;
  } else {
    // Hora - Fecha completa si es de hace más de una semana
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = d.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
    return `${time} - ${date}`;
  }
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return "-";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
}