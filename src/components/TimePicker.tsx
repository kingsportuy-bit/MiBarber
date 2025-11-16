"use client";

import React, { useState, useRef } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface TimePickerProps {
  value?: string; // Format: "HH:MM"
  onChange?: (time: string) => void;
  className?: string;
}

export function TimePicker({
  value = "09:00",
  onChange,
  className = ''
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(parseInt(value.split(':')[0]));
  const [selectedMinute, setSelectedMinute] = useState(parseInt(value.split(':')[1]));
  const { isMobile } = useDeviceDetection();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleTimeChange = () => {
    const formattedHour = selectedHour.toString().padStart(2, '0');
    const formattedMinute = selectedMinute.toString().padStart(2, '0');
    const timeString = `${formattedHour}:${formattedMinute}`;
    onChange?.(timeString);
    setIsOpen(false);
  };

  const handleTouchOutside = (e: React.TouchEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minutes (0-59, step 5)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  if (isMobile) {
    // Native time picker for mobile devices
    return (
      <input
        type="time"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
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
        <span>{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
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
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-center">Seleccionar hora</h3>
            </div>
            
            {/* Time selectors */}
            <div className="flex flex-col sm:flex-row flex-grow overflow-hidden">
              {/* Hours */}
              <div className="flex-1 border-r border-gray-100 overflow-auto">
                <div className="p-2 text-center text-xs font-medium text-gray-500 bg-gray-50">
                  Horas
                </div>
                <div className="flex flex-col">
                  {hours.map(hour => {
                    const isSelected = hour === selectedHour;
                    return (
                      <button
                        key={hour}
                        onClick={() => setSelectedHour(hour)}
                        className={`text-sm p-3 text-center transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {hour.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Minutes */}
              <div className="flex-1 overflow-auto">
                <div className="p-2 text-center text-xs font-medium text-gray-500 bg-gray-50">
                  Minutos
                </div>
                <div className="flex flex-col">
                  {minutes.map(minute => {
                    const isSelected = minute === selectedMinute;
                    return (
                      <button
                        key={minute}
                        onClick={() => setSelectedMinute(minute)}
                        className={`text-sm p-3 text-center transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {minute.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleTimeChange}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}