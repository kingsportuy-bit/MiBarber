"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Sucursal } from "@/types/db";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Sucursal>;
  onSave: (values: Partial<Sucursal>) => Promise<void>;
  onCancel?: () => void;
};

export function EditarSucursalModal({ open, onOpenChange, initial, onSave, onCancel }: Props) {
  const isEdit = Boolean(initial?.id);
  
  const [nombre_sucursal, setNombreSucursal] = useState(initial?.nombre_sucursal || "");
  const [telefono, setTelefono] = useState(initial?.telefono || "");
  const [direccion, setDireccion] = useState(initial?.direccion || "");
  const [info, setInfo] = useState(initial?.info || "");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setNombreSucursal(initial?.nombre_sucursal || "");
      setTelefono(initial?.telefono || "");
      setDireccion(initial?.direccion || "");
      setInfo(initial?.info || "");
      setErrors({});
    }
  }, [open, initial]);

  // Validar el formulario
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!nombre_sucursal.trim()) {
      newErrors.nombre_sucursal = "El nombre de la sucursal es obligatorio";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    try {
      const sucursalData = {
        nombre_sucursal,
        telefono,
        direccion,
        info,
      };
      
      console.log("Datos a enviar para guardar sucursal:", sucursalData);
      // Guardar datos de la sucursal
      await onSave(sucursalData);
      
      toast.success(isEdit ? "Sucursal actualizada" : "Sucursal creada");
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar la sucursal");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md md:max-w-2xl -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="qoder-dark-card max-h-[90vh] overflow-y-auto">
            <div className="qoder-dark-window-header">
              <Dialog.Title className="text-lg font-semibold text-qoder-dark-text-primary">
                {isEdit ? "Editar sucursal" : "Nueva sucursal"}
              </Dialog.Title>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Nombre de la Sucursal</label>
                <input 
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.nombre_sucursal ? "border-red-500" : ""}`} 
                  value={nombre_sucursal} 
                  onChange={(e) => setNombreSucursal(e.target.value)} 
                  placeholder="Nombre de la sucursal"
                />
                {errors.nombre_sucursal && <p className="text-red-500 text-xs mt-1">{errors.nombre_sucursal}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Teléfono</label>
                <input 
                  className="w-full qoder-dark-input p-3 rounded-lg" 
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value)} 
                  placeholder="Teléfono"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Dirección</label>
                <input 
                  className="w-full qoder-dark-input p-3 rounded-lg" 
                  value={direccion} 
                  onChange={(e) => setDireccion(e.target.value)} 
                  placeholder="Dirección completa"
                />
              </div>
              
              {/* Campo para información adicional */}
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Información Adicional</label>
                <textarea 
                  className="w-full qoder-dark-input p-3 rounded-lg" 
                  value={info} 
                  onChange={(e) => setInfo(e.target.value)} 
                  placeholder="Información adicional sobre la sucursal"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-between gap-2 p-4 pt-0">
              <button
                type="button"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  }
                  onOpenChange(false);
                }}
                className="cancel-button"
              >
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="action-button"
              >
                <span>{isEdit ? "Actualizar" : "Crear sucursal"}</span>
              </button>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}