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

export function EditarInfoAdicionalModal({ open, onOpenChange, initial, onSave, onCancel }: Props) {
  const isEdit = Boolean(initial?.id);
  
  const [info, setInfo] = useState(initial?.info || "");
  
  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setInfo(initial?.info || "");
    }
  }, [open, initial]);

  const handleSubmit = async () => {
    try {
      // Verificar que se tenga un ID válido antes de intentar actualizar
      if (!initial?.id) {
        throw new Error("No se puede actualizar la información adicional sin un ID de sucursal válido");
      }
      
      const sucursalData = {
        id: initial.id, // Incluir el ID para actualizar la sucursal existente
        info,
      };
      
      console.log("Datos a enviar para guardar información adicional:", sucursalData);
      // Guardar solo la información adicional
      await onSave(sucursalData);
      
      toast.success("Información adicional actualizada");
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error(`Error al guardar la información adicional: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 qoder-dark-modal-overlay-global" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="qoder-dark-client-modal">
            <div className="qoder-dark-window-header">
              <Dialog.Title className="text-lg font-semibold text-qoder-dark-text-primary">
                Editar Información Adicional
              </Dialog.Title>
            </div>
            
            <div className="content">
              <div className="grid grid-cols-1 gap-3">
              {/* Campo para información adicional */}
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Información Adicional</label>
                <textarea 
                  className="w-full qoder-dark-input p-3 rounded-lg" 
                  value={info} 
                  onChange={(e) => setInfo(e.target.value)} 
                  placeholder="Información adicional sobre la sucursal"
                  rows={6}
                />
                <p className="text-qoder-dark-text-secondary text-xs mt-1">
                  Puedes incluir detalles como políticas, servicios especiales, o cualquier otra información relevante.
                </p>
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
                <span>Actualizar Información</span>
              </button>
            </div>
          </div>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}