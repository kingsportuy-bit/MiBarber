"use client";

import type { Appointment } from "@/types/db";

interface ConfirmationStepProps {
  formData: Partial<Appointment>;
  prevStep: () => void;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
  isSubmitting: boolean;
  isEditMode: boolean;
}

/**
 * Paso 4 del wizard: Confirmación y envío
 */
export function ConfirmationStep({ 
  formData, 
  prevStep,
  onSubmit,
  isSubmitting,
  isEditMode
}: ConfirmationStepProps) {
  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-qoder-dark-text-primary mb-2">
          Confirmar {isEditMode ? 'Cambios' : 'Nueva Cita'}
        </h3>
        
        <div className="bg-qoder-dark-bg-secondary rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-qoder-dark-text-secondary">Cliente</label>
              <div className="text-qoder-dark-text-primary">{formData.cliente_nombre}</div>
            </div>
            
            <div>
              <label className="text-xs text-qoder-dark-text-secondary">Servicio</label>
              <div className="text-qoder-dark-text-primary">{formData.servicio}</div>
            </div>
            
            <div>
              <label className="text-xs text-qoder-dark-text-secondary">Barbero</label>
              <div className="text-qoder-dark-text-primary">{formData.barbero}</div>
            </div>
            
            <div>
              <label className="text-xs text-qoder-dark-text-secondary">Fecha y Hora</label>
              <div className="text-qoder-dark-text-primary">
                {formData.fecha} a las {formData.hora}
              </div>
            </div>
            
            {formData.ticket && (
              <div>
                <label className="text-xs text-qoder-dark-text-secondary">Precio</label>
                <div className="text-qoder-dark-text-primary">${formData.ticket}</div>
              </div>
            )}
            
            {formData.duracion && (
              <div>
                <label className="text-xs text-qoder-dark-text-secondary">Duración</label>
                <div className="text-qoder-dark-text-primary">{formData.duracion} minutos</div>
              </div>
            )}
          </div>
          
          {formData.nota && (
            <div>
              <label className="text-xs text-qoder-dark-text-secondary">Nota</label>
              <div className="text-qoder-dark-text-primary">{formData.nota}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="cancel-button px-4 py-2 rounded-lg"
          disabled={isSubmitting}
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="action-button px-4 py-2 rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </div>
  );
}