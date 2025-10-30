"use client";

import { useMemo } from "react";
import type { Appointment } from "@/types/db";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { SimpleCalendar } from "@/components/SimpleCalendar";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { getLocalDateString } from "@/utils/dateUtils";

interface DateTimeStepProps {
  formData: Partial<Appointment>;
  updateFormData: (updates: Partial<Appointment>) => void;
  nextStep: () => void;
  prevStep: () => void;
  sucursalId?: string;
}

/**
 * Paso 3 del wizard: Selección de fecha y hora
 */
export function DateTimeStep({ 
  formData, 
  updateFormData, 
  nextStep,
  prevStep,
  sucursalId
}: DateTimeStepProps) {
  const { isAdmin, barbero: barberoActual } = useBarberoAuth();
  
  // Para barberos no administradores, usar el ID del barbero actual
  const idBarberoParaCitas = (!isAdmin && barberoActual?.id_barbero) 
    ? barberoActual.id_barbero 
    : (formData.id_barbero || undefined);

  const { data: citasData, isLoading: isLoadingCitas } = useCitas({
    sucursalId,
    fecha: formData.fecha,
    barberoId: idBarberoParaCitas,
  });

  // Generar horas disponibles basadas en la sucursal, barbero y citas existentes
  const generateAvailableTimes = () => {
    // Verificar que tengamos todos los datos necesarios
    if (!sucursalId || !formData.fecha || !formData.servicio) {
      return [];
    }

    // Obtener la duración del servicio seleccionado
    const duracionServicio = formData.duracion 
      ? parseInt(formData.duracion, 10) 
      : 30; // Por defecto 30 minutos

    const times: string[] = [];

    // Función para verificar si un horario está ocupado considerando la duración del servicio
    const isTimeSlotOccupied = (hour: number, minute: number): boolean => {
      // Si no hay datos de citas, no marcar como ocupado
      if (!citasData || citasData.length === 0) {
        return false;
      }

      // Convertir a string con formato HH:mm
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      // Verificar si hay alguna cita que se solape con este horario
      const occupied = citasData.some((cita: Appointment) => {
        // Solo considerar citas del mismo barbero
        if (cita.id_barbero !== idBarberoParaCitas) {
          return false;
        }

        // Solo considerar citas de la misma fecha
        if (cita.fecha !== formData.fecha) {
          return false;
        }

        // Si estamos editando una cita, ignorar la propia cita que estamos editando
        if (formData.id_cita && cita.id_cita === formData.id_cita) {
          return false;
        }

        // Obtener la hora de la cita
        const citaHora = cita.hora?.slice(0, 5);
        if (!citaHora) return false;

        // Encontrar el servicio de la cita para obtener su duración
        const duracionCita = cita.duracion ? parseInt(cita.duracion, 10) : 30; // Por defecto 30 minutos

        // Convertir la hora de la cita a minutos desde medianoche
        const [citaHour, citaMinute] = citaHora.split(":").map(Number);
        const citaStartMinutes = citaHour * 60 + citaMinute;
        const citaEndMinutes = citaStartMinutes + (duracionCita || 30);

        // Convertir la hora que estamos verificando a minutos desde medianoche
        const checkMinutes = hour * 60 + minute;
        const checkEndMinutes = checkMinutes + duracionServicio;

        // Verificar si hay solapamiento
        // Hay solapamiento si el inicio de uno es menor que el fin del otro y viceversa
        const isOverlapping =
          checkMinutes < citaEndMinutes && checkEndMinutes > citaStartMinutes;
          
        return isOverlapping;
      });

      return occupied;
    };

    // Generar horarios de 9:00 a 20:00 en bloques de 30 minutos
    for (let hour = 9; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Para la última hora, detenerse a las 20:30
        if (hour === 20 && minute > 30) break;
        
        // Verificar si este slot está ocupado
        if (!isTimeSlotOccupied(hour, minute)) {
          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          times.push(timeString);
        }
      }
    }

    // Si estamos editando una cita, asegurarse de que la hora de la cita existente esté disponible
    if (formData.id_cita && formData.hora) {
      const horaExistente = formData.hora.slice(0, 5); // Formato HH:MM
      
      // Verificar si la hora ya está en la lista
      if (!times.includes(horaExistente)) {
        // Agregar la hora existente al principio de la lista
        times.unshift(horaExistente);
      }
    }

    return times;
  };

  // Generar las horas disponibles
  const availableTimes = useMemo(() => {
    return generateAvailableTimes();
  }, [generateAvailableTimes]);

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    updateFormData({ fecha: formattedDate });
  };

  const handleDateChange = (dateString: string) => {
    updateFormData({ fecha: dateString });
  };

  const handleTimeChange = (time: string) => {
    updateFormData({ hora: time });
  };

  const handleNext = () => {
    if (!formData.fecha) {
      alert("Por favor seleccione una fecha");
      return;
    }
    
    if (!formData.hora) {
      alert("Por favor seleccione una hora");
      return;
    }
    
    nextStep();
  };

  // Función para verificar si una fecha está en el pasado
  const isDateInPast = (dateString: string) => {
    try {
      const today = getLocalDateString();
      
      // Comparar directamente las cadenas de fecha en formato YYYY-MM-DD
      return dateString < today;
    } catch (error) {
      console.error("Error al parsear fecha:", error);
      return true; // Bloquear selección si hay error
    }
  };

  // Función para verificar si una fecha está disponible
  const isDateAvailable = (date: Date) => {
    // Bloquear fechas pasadas
    const dateString = date.toISOString().split('T')[0];
    if (isDateInPast(dateString)) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-qoder-dark-text-primary mb-2">
          Seleccionar Fecha y Hora
        </h3>
        
        {/* Selector de fecha */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
            Fecha
          </label>
          <CustomDatePicker 
            value={formData.fecha}
            onChange={handleDateChange}
            min={getLocalDateString()}
            isDateDisabled={(date) => !isDateAvailable(date)}
          />
        </div>
        
        {/* Calendario para visualizar citas */}
        <div className="mb-4">
          <SimpleCalendar 
            sucursalId={sucursalId}
            barbero={idBarberoParaCitas}
            onDateSelect={handleDateSelect}
            initialView="dayGridMonth"
          />
        </div>
        
        {/* Selector de hora */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
            Hora
          </label>
          <select
            value={formData.hora || ""}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="qoder-dark-select w-full px-3 py-2 rounded-lg"
            disabled={!formData.fecha}
          >
            <option value="">Seleccione una hora</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {availableTimes.length === 0 && formData.fecha && (
            <p className="text-xs text-qoder-dark-text-secondary mt-1">
              No hay horarios disponibles para la fecha seleccionada
            </p>
          )}
        </div>
      </div>
      
      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="cancel-button px-4 py-2 rounded-lg"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="action-button px-4 py-2 rounded-lg"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}