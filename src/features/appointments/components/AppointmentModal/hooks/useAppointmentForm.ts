import { useState, useEffect } from 'react';
import type { Appointment } from '@/types/db';
import { validateClientStep, validateServiceStep, validateDateTimeStep } from '../../../utils/appointmentValidations';

interface UseAppointmentFormReturn {
  currentStep: number;
  formData: Partial<Appointment>;
  errors: Record<string, string>;
  updateFormData: (updates: Partial<Appointment>) => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  nextStep: () => void;
  prevStep: () => void;
  validateStep: (step: number) => boolean;
  isEditMode: boolean;
}

/**
 * Hook para manejar el estado del formulario del wizard de citas
 * @param editingAppointment - Cita que se está editando (opcional)
 * @returns Objeto con el estado y funciones del formulario
 */
export function useAppointmentForm(editingAppointment?: Appointment): UseAppointmentFormReturn {
  // ✅ Inicializar con función (solo se ejecuta UNA VEZ)
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Appointment>>(() => {
    // Si editingAppointment existe, cargar sus datos
    return editingAppointment || {
      estado: 'pendiente',
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const isEditMode = !!editingAppointment;

  // ✅ useEffect con dependencias CORRECTAS
  useEffect(() => {
    if (editingAppointment) {
      setFormData(editingAppointment);
    }
  }, [editingAppointment?.id_cita]); // ← Solo cuando ID cambia

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const validateStep = (step: number): boolean => {
    switch(step) {
      case 1: return validateClientStep(formData);
      case 2: return validateServiceStep(formData);
      case 3: return validateDateTimeStep(formData);
      default: return true;
    }
  };

  const updateFormData = (updates: Partial<Appointment>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return { 
    currentStep, 
    formData, 
    errors,
    updateFormData,
    setErrors,
    nextStep, 
    prevStep, 
    validateStep,
    isEditMode,
  };
}