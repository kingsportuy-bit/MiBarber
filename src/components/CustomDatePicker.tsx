"use client";

import { useState, useRef, useEffect } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { createPortal } from "react-dom";

interface CustomDatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  disabledDates?: string[];
  isDateDisabled?: (date: Date) => boolean;
}

export function CustomDatePicker({ 
  value, 
  onChange, 
  placeholder = "Seleccionar fecha",
  min,
  max,
  disabled = false,
  disabledDates = [],
  isDateDisabled
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (!value) return null;
    // Parsear la fecha manteniendo la zona horaria local
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  });
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const [currentYearView, setCurrentYearView] = useState<number>(new Date().getFullYear());
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside([calendarRef, inputRef], () => setIsOpen(false));

  useEffect(() => {
    if (value) {
      // Parsear la fecha manteniendo la zona horaria local
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentDate(date);
      }
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen || !inputRef.current || !calendarRef.current) return;

    const updatePosition = () => {
      if (inputRef.current && calendarRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        calendarRef.current.style.top = `${rect.bottom + 4}px`;
        calendarRef.current.style.left = `${rect.left}px`;
      }
    };

    updatePosition();
    
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const toggleCalendar = () => {
    if (!disabled) {
      const willOpen = !isOpen;
      setIsOpen(willOpen);
      
      if (willOpen) {
        setViewMode('days');
        if (value) {
          // Parsear la fecha manteniendo la zona horaria local
          const [year, month, day] = value.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            setCurrentDate(date);
          }
        }
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    if (min && date < new Date(min)) return;
    if (max && date > new Date(max)) return;
    
    setSelectedDate(date);
    setCurrentDate(date);
    setIsOpen(false);
    
    if (onChange) {
      // Formatear la fecha manteniendo la zona horaria local
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
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

  const navigateYear = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() + direction);
      return newDate;
    });
  };

  const navigateYearView = (direction: number) => {
    setCurrentYearView(prev => prev + direction * 12);
  };

  const goToCurrentMonthYear = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    if (onChange) {
      // Formatear la fecha manteniendo la zona horaria local
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
    }
  };

  const switchToMonthsView = () => {
    setViewMode('months');
  };

  const switchToYearsView = () => {
    console.log('Switching to years view');
    setViewMode('years');
    // Centrar la vista de años en el año actual o en el año seleccionado
    const yearToCenter = selectedDate ? selectedDate.getFullYear() : currentDate.getFullYear();
    setCurrentYearView(yearToCenter);
  };

  const selectMonth = (month: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month);
    setCurrentDate(newDate);
    setViewMode('days');
  };

  const selectYear = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setViewMode('months');
  };

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateDisabledInternal = (date: Date) => {
    if (isDateDisabled && isDateDisabled(date)) {
      return true;
    }
    
    if (disabledDates.length > 0) {
      // Formatear la fecha manteniendo la zona horaria local
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      if (disabledDates.includes(dateString)) {
        return true;
      }
    }
    
    if (min && date < new Date(min)) return true;
    if (max && date > new Date(max)) return true;
    
    return false;
  };

  const isDateDisabledFunc = (date: Date) => {
    return isDateDisabledInternal(date);
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = generateDays();
  const monthYear = currentDate.toLocaleDateString('es-UY', { month: 'long', year: 'numeric' });

  return (
    <div className="relative" ref={inputRef} style={{ transform: 'translateZ(0)' }}>
      <div 
        className={`w-full qoder-dark-input p-1 rounded cursor-pointer flex items-center justify-between ${disabled ? 'opacity-10 cursor-not-allowed' : ''}`}
        onClick={toggleCalendar}
      >
        <span className={selectedDate ? "text-qoder-dark-text-primary" : "text-qoder-dark-text-secondary"}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-qoder-dark-text-secondary" 
          viewBox="0 0 20 20" 
          fill="orange"
        >
          <path 
            fillRule="evenodd" 
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>

      {isOpen && !disabled && typeof window !== 'undefined' && createPortal(
        <div 
          ref={calendarRef}
          style={{
            position: 'fixed',
            top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 4 : 0,
            left: inputRef.current ? inputRef.current.getBoundingClientRect().left : 0,
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
          className="bg-qoder-dark-bg-primary border border-qoder-dark-border rounded-lg shadow-lg w-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Encabezado del calendario o navegación de años */}
          {viewMode === 'days' || viewMode === 'months' ? (
            <div className="flex items-center justify-between p-0 border-b border-qoder-dark-border">
              <button 
                onClick={() => navigateMonth(-1)}
                className="boton-simple p-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div 
                className="text-qoder-dark-text-primary cursor-pointer hover:bg-qoder-dark-bg-secondary rounded px-1 py-0.5 text-sm" 
                onClick={switchToYearsView}
              >
                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
              </div>
              
              <button 
                onClick={() => navigateMonth(1)}
                className="boton-simple p-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-1 border-b border-qoder-dark-border">
              <button 
                onClick={() => navigateYearView(-1)}
                className="boton-simple p-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="text-qoder-dark-text-primary text-sm">
                {currentYearView - 5} - {currentYearView + 6}
              </div>
              
              <button 
                onClick={() => navigateYearView(1)}
                className="boton-simple p-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Vista de días */}
          {viewMode === 'days' && (
            <>
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-0 p-1 auto-rows-[0.2rem]">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-xs text-qoder-dark-text-secondary py-0,5">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-0 p-1">
                {days.map((dayObj, index) => {
                  const { date, isCurrentMonth } = dayObj;
                  const isDisabled = isDateDisabledFunc(date);
                  const isSelected = isDateSelected(date);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !isDisabled && handleDateSelect(date)}
                      disabled={isDisabled}
                      style={{
                        background: isSelected ? 'rgba(249, 115, 22, 0.8)' : 'transparent',
                        color: isSelected ? '#ffffff' : (!isCurrentMonth ? '#9ca3af' : '#ffffff'),
                        border: 'none',
                        padding: '0.00001rem',
                        borderRadius: '0.925rem',
                        fontSize: '0.925rem',
                        textAlign: 'center',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.3 : 1,
                        textDecoration: isDisabled ? 'line-through' : 'none',
                        transition: 'all 0.5s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled && !isSelected && isCurrentMonth) {
                          e.currentTarget.style.background = 'rgba(249, 115, 22, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled && !isSelected) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                      className=""
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Vista de meses */}
          {viewMode === 'months' && (
            <div className="p-1">
              <div className="grid grid-cols-3 gap-1">
                {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((month, index) => (
                  <button
                    key={month}
                    onClick={() => selectMonth(index)}
                    style={
                      currentDate.getMonth() === index
                        ? {
                            background: '#374151',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.25rem',
                            borderRadius: '0.125rem',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            cursor: 'pointer'

                          }
                        : {
                            background: 'transparent',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.25rem',
                            borderRadius: '0.125rem',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            cursor: 'pointer'
                          }
                    }
                    onMouseEnter={(e) => {
                      if (currentDate.getMonth() !== index) {
                        e.currentTarget.style.background = 'rgba(249, 115, 22, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentDate.getMonth() !== index) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vista de años */}
          {viewMode === 'years' && (
            <div className="grid grid-cols-3 gap-1 p-1">
              {Array.from({ length: 12 }, (_, i) => currentYearView - 5 + i).map(year => (
                <button
                  key={year}
                  onClick={() => selectYear(year)}
                  style={
                    currentDate.getFullYear() === year
                      ? {
                          background: '#374151',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.25rem',
                          borderRadius: '0.125rem',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          cursor: 'pointer'
                          
                        }
                      : {
                          background: 'transparent',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.25rem',
                          borderRadius: '0.125rem',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }
                  }
                  onMouseEnter={(e) => {
                    if (currentDate.getFullYear() !== year) {
                      e.currentTarget.style.background = 'rgba(249, 115, 22, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentDate.getFullYear() !== year) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
          
          {/* Botones adicionales */}
          <div className="flex justify-between p-2 border-t border-qoder-dark-border">
            <span 
              onClick={() => {
                setSelectedDate(null);
                setIsOpen(false);
                if (onChange) {
                  onChange("");
                }
              }}
              className="text-qoder-dark-text-muted text-sm cursor-pointer hover:text-qoder-dark-text-primary px-2"
            >
              Borrar
            </span>
            <span 
              onClick={goToCurrentMonthYear}
              className="text-qoder-dark-text-muted text-sm cursor-pointer hover:text-qoder-dark-text-primary px-2"
            >
              Hoy
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}