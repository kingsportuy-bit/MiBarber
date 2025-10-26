"use client";

import { useState, useRef, useEffect } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

interface CustomDatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  disabledDates?: string[]; // Agregar esta propiedad para fechas deshabilitadas
  isDateDisabled?: (date: Date) => boolean; // Agregar esta propiedad para función de deshabilitar fechas
}

export function CustomDatePicker({ 
  value, 
  onChange, 
  placeholder = "Seleccionar fecha",
  min,
  max,
  disabled = false,
  disabledDates = [], // Agregar esta propiedad
  isDateDisabled // Agregar esta propiedad
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(calendarRef, () => setIsOpen(false));

  // Actualizar la fecha seleccionada cuando cambia el valor
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentDate(new Date(value));
    }
  }, [value]);

  const toggleCalendar = () => {
    setIsOpen(!isOpen);
    if (!isOpen && value) {
      setCurrentDate(new Date(value));
    }
  };

  const handleDateSelect = (date: Date) => {
    // Verificar si la fecha está dentro del rango permitido
    if (min && date < new Date(min)) return;
    if (max && date > new Date(max)) return;
    
    setSelectedDate(date);
    setCurrentDate(date);
    setIsOpen(false);
    
    if (onChange) {
      // Formatear la fecha como YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      onChange(formattedDate);
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // Generar días del mes
  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    // Día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Número de días en el mes
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Agregar días del mes anterior para completar la primera semana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Agregar días del mes siguiente para completar las semanas
    const totalCells = 42; // 6 semanas * 7 días
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    // Formato dd/mm/yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateDisabledInternal = (date: Date) => {
    // Verificar si la fecha está deshabilitada por la función externa
    if (isDateDisabled && isDateDisabled(date)) {
      return true;
    }
    
    // Verificar si la fecha está en la lista de fechas deshabilitadas
    if (disabledDates.length > 0) {
      const dateString = date.toISOString().split('T')[0];
      if (disabledDates.includes(dateString)) {
        return true;
      }
    }
    
    // Verificar si la fecha está fuera del rango mínimo/máximo
    if (min && date < new Date(min)) return true;
    if (max && date > new Date(max)) return true;
    
    return false;
  };

  const isDateDisabledFunc = (date: Date) => {
    if (isDateDisabledInternal(date)) return true;
    if (min && date < new Date(min)) return true;
    if (max && date > new Date(max)) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = generateDays();
  const monthYear = currentDate.toLocaleDateString('es-UY', { month: 'long', year: 'numeric' });

  return (
    <div className="relative">
      <div 
        className={`w-full qoder-dark-input p-2 rounded cursor-pointer flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && toggleCalendar()}
      >
        <span className={selectedDate ? "text-qoder-dark-text-primary" : "text-qoder-dark-text-secondary"}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-qoder-dark-text-secondary" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div 
          ref={calendarRef}
          className="absolute z-50 mt-1 bg-qoder-dark-bg-primary border border-qoder-dark-border rounded-lg shadow-lg w-72"
        >
          {/* Encabezado del calendario */}
          <div className="flex items-center justify-between p-3 border-b border-qoder-dark-border">
            <button 
              onClick={() => navigateMonth(-1)}
              className="p-1 rounded hover:bg-qoder-dark-bg-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="font-medium text-qoder-dark-text-primary">
              {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
            </div>
            
            <button 
              onClick={() => navigateMonth(1)}
              className="p-1 rounded hover:bg-qoder-dark-bg-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-qoder-dark-text-secondary py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {days.map((dayObj, index) => {
              const { date, isCurrentMonth } = dayObj;
              const isDisabled = isDateDisabledFunc(date);
              const isSelected = isDateSelected(date);
              
              return (
                <button
                  key={index}
                  onClick={() => !isDateDisabledFunc(date) && handleDateSelect(date)}
                  disabled={isDateDisabledFunc(date)}
                  className={`
                    text-center text-sm p-1 rounded-full transition-colors
                    ${!isCurrentMonth ? 'text-qoder-dark-text-muted' : 'text-qoder-dark-text-primary'}
                    ${isSelected ? 'bg-qoder-dark-accent-primary text-white' : ''}
                    ${!isDateDisabledFunc(date) && isCurrentMonth ? 'hover:bg-qoder-dark-bg-secondary' : ''}
                    ${isDateDisabledFunc(date) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          
          {/* Botón para cerrar */}
          <div className="p-2 border-t border-qoder-dark-border">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full qoder-dark-button text-sm py-1 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
