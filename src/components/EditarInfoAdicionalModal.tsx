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
        <Dialog.Overlay className="v2-overlay" />
        <Dialog.Content className="v2-modal" style={{ maxWidth: '600px' }}>
          <div className="v2-modal-header">
            <Dialog.Title className="v2-modal-title">
              Editar Información Adicional
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
            <div className="grid grid-cols-1 gap-4">
              {/* Campo para información adicional */}
              <div className="col-span-2">
                <label className="v2-label">Información Adicional</label>
                <textarea 
                  className="v2-textarea" 
                  value={info} 
                  onChange={(e) => setInfo(e.target.value)} 
                  placeholder="Información adicional sobre la sucursal"
                  rows={6}
                />
                <p className="text-[var(--text-secondary)] text-xs mt-1">
                  Puedes incluir detalles como políticas, servicios especiales, o cualquier otra información relevante.
                </p>
              </div>
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
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="v2-btn v2-btn-primary"
            >
              Actualizar Información
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
