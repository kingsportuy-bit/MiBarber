"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Service } from "@/types/db";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Service>;
  onSave: (values: Omit<Service, "id_servicio" | "created_at" | "updated_at" | "activo"> | Partial<Service>) => Promise<void>;
  onCancel?: () => void;
};

export function ServicioModal({ open, onOpenChange, initial, onSave, onCancel }: Props) {
  const isEdit = Boolean(initial?.id_servicio);
  
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [precio, setPrecio] = useState(initial?.precio || 0);
  const [duracion_minutos, setDuracionMinutos] = useState(initial?.duracion_minutos || 30);
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setNombre(initial?.nombre || "");
      setPrecio(initial?.precio || 0);
      setDuracionMinutos(initial?.duracion_minutos || 30);
      setDescripcion(initial?.descripcion || "");
      setErrors({});
    }
  }, [open, initial]);

  // Validar el formulario
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre del servicio es obligatorio";
    }
    
    if (precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    try {
      const serviceData: any = {
        nombre,
        precio,
        duracion_minutos,
        descripcion: descripcion || null
      };
      
      await onSave(serviceData);
      toast.success(isEdit ? "Servicio actualizado" : "Servicio creado");
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar el servicio");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md md:max-w-lg -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="qoder-dark-card max-h-[90vh] overflow-y-auto">
            <div className="qoder-dark-window-header">
              <Dialog.Title className="text-lg font-semibold text-qoder-dark-text-primary">
                {isEdit ? "Editar servicio" : "Nuevo servicio"}
              </Dialog.Title>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Nombre del Servicio</label>
                <input 
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.nombre ? "border-red-500" : ""}`} 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  placeholder="Ej: Corte de cabello"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs text-qoder-dark-text-secondary">Precio ($)</label>
                <input 
                  type="number"
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.precio ? "border-red-500" : ""}`} 
                  value={precio || ""} 
                  onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)} 
                  placeholder="Ej: 500"
                  min="0"
                  step="10"
                />
                {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs text-qoder-dark-text-secondary">Duración (minutos)</label>
                <input 
                  type="number"
                  className="w-full qoder-dark-input p-3 rounded-lg" 
                  value={duracion_minutos || ""} 
                  onChange={(e) => setDuracionMinutos(parseInt(e.target.value) || 0)} 
                  placeholder="Ej: 30"
                  min="5"
                  step="5"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Descripción</label>
                <input 
                  className="w-full qoder-dark-input p-3 rounded-lg" 
                  value={descripcion || ""} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  placeholder="Descripción del servicio"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 p-4 pt-0">
              <button
                type="button"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  }
                  onOpenChange(false);
                }}
                className="qoder-dark-button px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
              >
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
                disabled={!nombre || precio <= 0}
              >
                <span>{isEdit ? "Actualizar" : "Crear servicio"}</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}