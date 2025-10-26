"use client";

import { getLocalDateString, getDayOfWeek, formatDisplayDate } from "@/utils/dateUtils";

export function DateTest() {
  const today = getLocalDateString();
  const dayOfWeek = getDayOfWeek(today);
  const displayDate = formatDisplayDate(today);
  
  return (
    <div className="qoder-dark-window p-4 m-4">
      <h3 className="text-lg font-bold text-qoder-dark-text-primary mb-2">Prueba de Fechas</h3>
      <div className="space-y-2 text-qoder-dark-text-primary">
        <p>Fecha actual (local): {today}</p>
        <p>Día de la semana (0=Dom, 1=Lun, etc.): {dayOfWeek}</p>
        <p>Fecha formateada: {displayDate}</p>
      </div>
    </div>
  );
}