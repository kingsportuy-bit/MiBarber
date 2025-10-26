"use client";

import React, { useState } from "react";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { useSucursales } from "@/hooks/useSucursales";
import { HorariosSucursalForm } from "@/components/HorariosSucursalForm";
import type { Sucursal } from "@/types/db";

interface NuevaSucursalFormProps {
  onCancel: () => void;
  onSucursalCreada: (idSucursal: string) => void;
  idBarberia?: string;
}

export function NuevaSucursalForm({ 
  onCancel, 
  onSucursalCreada,
  idBarberia
}: NuevaSucursalFormProps) {
  const { createSucursalMutation } = useBarberiaInfo();
  const { createSucursal } = useSucursales(idBarberia);
  const [step, setStep] = useState<'datos' | 'horarios'>('datos');
  const [newSucursalId, setNewSucursalId] = useState<string | null>(null);
  
  // Estados para nueva sucursal
  const [newSucursal, setNewSucursal] = useState({
    nombre_sucursal: "",
    celular: "",
    telefono: "",
    direccion: ""
  });

  // Manejar cambios en el formulario de sucursal
  const handleSucursalChange = (field: string, value: string) => {
    setNewSucursal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Agregar una nueva sucursal
  const addSucursal = () => {
    if (newSucursal.nombre_sucursal && idBarberia) {
      createSucursal.mutate({
        ...newSucursal,
        id_barberia: idBarberia,
        horario: null // horario es nullable
      }, {
        onSuccess: (data) => {
          if (data && data.id) {
            setNewSucursalId(data.id);
            setStep('horarios');
            // No cerramos el formulario aún, pasamos a configurar horarios
          }
        },
        onError: (error: any) => {
          console.error("Error al agregar la sucursal:", error);
          alert("Error al agregar la sucursal");
        }
      });
    }
  };

  return (
    <div className="mb-8 p-6 bg-qoder-dark-bg-primary rounded-lg border border-qoder-dark-border-primary">
      {step === 'datos' ? (
        <>
          <h3 className="text-xl font-semibold text-qoder-dark-text-primary mb-4">
            Agregar Nueva Sucursal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Nombre de la Sucursal
              </label>
              <input 
                type="text" 
                value={newSucursal.nombre_sucursal} 
                onChange={(e) => handleSucursalChange("nombre_sucursal", e.target.value)} 
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Nombre de la sucursal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Celular
              </label>
              <input 
                type="text" 
                value={newSucursal.celular} 
                onChange={(e) => handleSucursalChange("celular", e.target.value)} 
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Celular"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Teléfono
              </label>
              <input 
                type="text" 
                value={newSucursal.telefono} 
                onChange={(e) => handleSucursalChange("telefono", e.target.value)} 
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Teléfono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Dirección
              </label>
              <input 
                type="text" 
                value={newSucursal.direccion} 
                onChange={(e) => handleSucursalChange("direccion", e.target.value)} 
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Dirección completa"
              />
            </div>
          </div>
          
          {/* Sección de horarios - explicación */}
          <div className="mt-6 pt-6 border-t border-qoder-dark-border-primary">
            <h4 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">
              Configurar Horarios
            </h4>
            <p className="text-qoder-dark-text-secondary text-sm mb-4">
              Después de crear la sucursal, se le pedirá que configure los horarios.
            </p>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={onCancel}
              className="qoder-dark-button px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button 
              onClick={addSucursal}
              className="qoder-dark-button-primary px-4 py-2 rounded-lg"
              disabled={!newSucursal.nombre_sucursal}
            >
              Continuar a Horarios
            </button>
          </div>
        </>
      ) : step === 'horarios' && newSucursalId ? (
        <>
          <h3 className="text-xl font-semibold text-qoder-dark-text-primary mb-4">
            Configurar Horarios para {newSucursal.nombre_sucursal}
          </h3>
          <div className="mb-6">
            <p className="text-qoder-dark-text-secondary">
              Configure los horarios para la nueva sucursal
            </p>
          </div>
          <div className="mb-4">
            <HorariosSucursalForm 
              idSucursal={newSucursalId} 
              onClose={() => {
                onSucursalCreada(newSucursalId);
              }} 
            />
          </div>
        </>
      ) : null}
    </div>
  );
}