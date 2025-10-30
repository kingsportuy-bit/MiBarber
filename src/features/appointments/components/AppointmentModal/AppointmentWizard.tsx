"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect, useMemo } from "react";
import type { Appointment } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useAppointmentForm } from "./hooks/useAppointmentForm";
import { ClientStep } from "./steps/ClientStep";
import { ServiceStep } from "./steps/ServiceStep";
import { DateTimeStep } from "./steps/DateTimeStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";

export interface AppointmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  onSave: (values: Appointment) => Promise<void>;
  sucursalId?: string;
}

/**
 * Wizard de creación/edición de citas
 */
export function AppointmentWizard({
  open,
  onOpenChange,
  initial,
  onSave,
  sucursalId: propSucursalId,
}: AppointmentWizardProps) {
  const [selectedSucursalId, setSelectedSucursalId] = useState<string | undefined>(propSucursalId);
  const [isInitialSelectionDone, setIsInitialSelectionDone] = useState(false);
  const { idBarberia, isAdmin, barbero: barberoActual } = useBarberoAuth();
  const { sucursales: allSucursales, isLoading: isLoadingSucursales } = useSucursales(idBarberia || undefined);
  
  // ✅ Memoizar el estado inicial
  const initialData = useMemo(
    () => initial ? { ...initial } as Appointment : undefined,
    [initial?.id_cita]
  );
  
  const {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    isEditMode
  } = useAppointmentForm(initialData);

  // Preseleccionar la sucursal cuando se carguen las sucursales
  useEffect(() => {
    if (allSucursales && allSucursales.length > 0 && !isInitialSelectionDone && !propSucursalId) {
      // Para barberos normales, seleccionar automáticamente su sucursal
      if (!isAdmin && barberoActual?.id_sucursal) {
        setSelectedSucursalId(barberoActual.id_sucursal);
      } else {
        // Para administradores, seleccionar la primera sucursal por defecto
        setSelectedSucursalId(allSucursales[0].id);
      }
      // Marcar que se ha hecho la selección inicial
      setIsInitialSelectionDone(true);
    }
  }, [allSucursales, isInitialSelectionDone, isAdmin, barberoActual?.id_sucursal, propSucursalId]);

  // Efecto para asegurar que la sucursal se establezca correctamente cuando se proporciona una
  useEffect(() => {
    if (propSucursalId && propSucursalId !== selectedSucursalId) {
      setSelectedSucursalId(propSucursalId);
    }
  }, [propSucursalId, selectedSucursalId]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Construir el objeto completo con todos los campos requeridos
      const valuesWithSucursal: any = {
        // Campos básicos
        fecha: formData.fecha,
        hora: formData.hora,
        cliente_nombre: formData.cliente_nombre,
        servicio: formData.servicio,
        barbero: formData.barbero,
        telefono: formData.telefono || null, // Agregar el teléfono del cliente
        // Campos adicionales con valores por defecto si no están presentes
        estado: formData.estado || "pendiente",
        nota: formData.nota || null,
        id_cliente: formData.id_cliente || null,
        ticket: formData.ticket || null,
        nro_factura: formData.nro_factura || null,
        duracion: formData.duracion || null,
        // Campos de identificación
        id_sucursal: selectedSucursalId,
        id_barberia: idBarberia || undefined,
        // Agregar IDs del barbero y servicio si están disponibles
        id_barbero: formData.id_barbero || null,
        id_servicio: formData.id_servicio || null,
      };

      // Eliminar campos undefined
      Object.keys(valuesWithSucursal).forEach((key) => {
        if (valuesWithSucursal[key] === undefined) {
          delete valuesWithSucursal[key];
        }
      });

      await onSave(valuesWithSucursal);
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar el turno:", error);
      alert("Error al guardar el turno. Por favor intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-4 md:p-6 bg-qoder-dark-bg-form border border-qoder-dark-border shadow-2xl focus:outline-none"
        >
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-qoder-dark-text-primary">
              {isEditMode ? "Editar Turno" : "Nuevo Turno"} - Paso {currentStep} de 4
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-full hover:bg-qoder-dark-bg-hover text-qoder-dark-text-secondary"
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </Dialog.Close>
          </div>
          
          <div className="space-y-4">
            {/* Indicador de progreso */}
            <div className="flex justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === step
                        ? "bg-qoder-dark-accent-primary text-white"
                        : step < currentStep
                        ? "bg-qoder-dark-accent-secondary text-white"
                        : "bg-qoder-dark-bg-secondary text-qoder-dark-text-secondary"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`h-1 w-8 ${
                        step < currentStep
                          ? "bg-qoder-dark-accent-secondary"
                          : "bg-qoder-dark-bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Renderizar el paso actual */}
            {currentStep === 1 && (
              <ClientStep
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                sucursalId={selectedSucursalId}
              />
            )}
            
            {currentStep === 2 && (
              <ServiceStep
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                prevStep={prevStep}
                sucursalId={selectedSucursalId}
                idBarberia={idBarberia || undefined}
              />
            )}
            
            {currentStep === 3 && (
              <DateTimeStep
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                prevStep={prevStep}
                sucursalId={selectedSucursalId}
              />
            )}
            
            {currentStep === 4 && (
              <ConfirmationStep
                formData={formData}
                prevStep={prevStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isEditMode={isEditMode}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}