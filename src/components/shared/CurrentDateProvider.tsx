'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getLocalDateString, getLocalDateTime } from '@/shared/utils/dateUtils';

interface CurrentDateContextType {
  currentDate: string; // Formato YYYY-MM-DD
  currentDateTime: Date;
  refreshDate: () => void;
}

const CurrentDateContext = createContext<CurrentDateContextType | undefined>(undefined);

export function CurrentDateProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState<string>(() => getLocalDateString());
  const [currentDateTime, setCurrentDateTime] = useState<Date>(() => getLocalDateTime());

  const refreshDate = () => {
    setCurrentDate(getLocalDateString());
    setCurrentDateTime(getLocalDateTime());
  };

  // Refrescar la fecha cada minuto para mantenerla actualizada
  useEffect(() => {
    const interval = setInterval(refreshDate, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, []);

  const value = useMemo(() => ({
    currentDate,
    currentDateTime,
    refreshDate
  }), [currentDate, currentDateTime]);

  return (
    <CurrentDateContext.Provider value={value}>
      {children}
    </CurrentDateContext.Provider>
  );
}

export function useCurrentDate() {
  const context = useContext(CurrentDateContext);
  if (context === undefined) {
    throw new Error('useCurrentDate must be used within a CurrentDateProvider');
  }
  return context;
}