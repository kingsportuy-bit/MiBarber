'use client';

import React from 'react';
import { useCurrentDate } from './CurrentDateProvider';

export function TestDateComponent() {
  const { currentDate, currentDateTime, refreshDate } = useCurrentDate();

  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Test de Fecha Actual</h3>
      <p>Fecha (YYYY-MM-DD): {currentDate}</p>
      <p>Fecha y Hora: {currentDateTime.toString()}</p>
      <button 
        onClick={refreshDate}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refrescar Fecha
      </button>
    </div>
  );
}