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
        <Dialog.Overlay className="v2-overlay" />
        <Dialog.Content className="v2-modal">
          <div className="v2-modal-header">
            <Dialog.Title className="v2-modal-title">
              {isEdit ? "Editar sucursal" : "Nueva sucursal"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl"
                aria-label="Cerrar"
              >
                ×
              </button>
            </Dialog.Close>
          </div>
          <div className="v2-modal-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="v2-label">Nombre de la Sucursal</label>
                <input 
                  className={`v2-input ${errors.nombre_sucursal ? "border-red-500" : ""}`} 
                  value={nombre_sucursal} 
                  onChange={(e) => setNombreSucursal(e.target.value)} 
                  placeholder="Nombre de la sucursal"
                />
                {errors.nombre_sucursal && <p className="text-red-500 text-xs mt-1">{errors.nombre_sucursal}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="v2-label">Teléfono</label>
                <input 
                  className="v2-input" 
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value)} 
                  placeholder="Teléfono"
                />
              </div>
              
              <div className="col-span-2">
                <label className="v2-label">Dirección</label>
                <input 
                  className="v2-input" 
                  value={direccion} 
                  onChange={(e) => setDireccion(e.target.value)} 
                  placeholder="Dirección completa"
                />
              </div>
              
              {/* Campo para información adicional */}
              <div className="col-span-2">
                <label className="v2-label">Información Adicional</label>
                <textarea 
                  className="v2-textarea" 
                  value={info} 
                  onChange={(e) => setInfo(e.target.value)} 
                  placeholder="Información adicional sobre la sucursal"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="v2-modal-footer">
              <button
                type="button"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  }
                  onOpenChange(false);
                }}
                className="v2-btn v2-btn-secondary"
              >
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="v2-btn v2-btn-primary"
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