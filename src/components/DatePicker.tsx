"use client";

import React, { useState, useRef } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DatePicker({
  value = new Date(),
  onChange,
  minDate,
  maxDate,
  className = ''
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value);
  const { isMobile } = useDeviceDetection();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDateChange = (date: Date) => {
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;
    
    setCurrentDate(date);
    onChange?.(date);
    setIsOpen(false);
  };

  const handleTouchOutside = (e: React.TouchEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    // Days from previous month to show
    const prevMonthDays = firstDay.getDay();
    // Total days to display
    const totalDays = prevMonthDays + lastDay.getDate();
    // Rows needed (ceiling of total days divided by 7)
    const rows = Math.ceil(totalDays / 7);
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month days
    const remainingDays = rows * 7 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const isDateSelected = (date: Date) => {
    return date.toDateString() === value.toDateString();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const days = generateCalendarDays();

  if (isMobile) {
    // Native date picker for mobile devices
    return (
      <input
        type="date"
        value={value.toISOString().split('T')[0]}
        onChange={(e) => handleDateChange(new Date(e.target.value))}
        min={minDate?.toISOString().split('T')[0]}
        max={maxDate?.toISOString().split('T')[0]}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      />
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      >
        <span>{formatDate(value)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
          onTouchStart={handleTouchOutside}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <button 
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Mes anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <h3 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h3>
              
              <button 
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Mes siguiente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 p-2 flex-grow overflow-auto">
              {days.map(({ date, isCurrentMonth }, index) => {
                const isSelected = isDateSelected(date);
                const isDisabled = isDateDisabled(date);
                
                return (
                  <button
                    key={index}
                    onClick={() => !isDisabled && handleDateChange(date)}
                    disabled={isDisabled}
                    className={`text-sm p-2 rounded-full text-center transition-colors ${
                      !isCurrentMonth 
                        ? 'text-gray-400' 
                        : isDisabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-blue-600 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}