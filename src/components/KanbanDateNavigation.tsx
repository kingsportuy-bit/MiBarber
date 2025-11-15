"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { es } from "date-fns/locale";

interface KanbanDateNavigationProps {
  onDateChange: (date: string) => void;
  currentDate: string;
}

export function KanbanDateNavigation({ onDateChange, currentDate }: KanbanDateNavigationProps) {
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);

  useEffect(() => {
    setSelectedDate(currentDate);
  }, [currentDate]);

  const handlePrevDay = () => {
    const newDate = subDays(new Date(selectedDate), 1);
    const newDateString = format(newDate, "yyyy-MM-dd");
    setSelectedDate(newDateString);
    onDateChange(newDateString);
  };

  const handleNextDay = () => {
    const newDate = addDays(new Date(selectedDate), 1);
    const newDateString = format(newDate, "yyyy-MM-dd");
    setSelectedDate(newDateString);
    onDateChange(newDateString);
  };

  const handleToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(today);
    onDateChange(today);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  };

  const isCurrentDateToday = isToday(new Date(selectedDate));

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-lg bg-qoder-dark-bg-secondary hover:bg-qoder-dark-bg-hover transition-colors"
          aria-label="Día anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="text-center min-w-[200px]">
          <span className="text-lg font-medium text-qoder-dark-text-primary">
            {formatDate(selectedDate)}
          </span>
        </div>
        
        <button
          onClick={handleNextDay}
          className="p-2 rounded-lg bg-qoder-dark-bg-secondary hover:bg-qoder-dark-bg-hover transition-colors"
          aria-label="Día siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {!isCurrentDateToday && (
        <button
          onClick={handleToday}
          className="px-4 py-2 rounded-lg bg-qoder-dark-button-primary hover:bg-qoder-dark-button-hover text-qoder-dark-button-primary-text transition-colors"
        >
          Hoy
        </button>
      )}
    </div>
  );
}