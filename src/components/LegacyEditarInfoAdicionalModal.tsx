import React, { useState, useEffect } from 'react';
import type { Sucursal } from "@/types/db";
import { toast } from "sonner";

interface LegacyEditarInfoAdicionalModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Sucursal>;
  onSave: (values: Partial<Sucursal>) => Promise<void>;
  onCancel?: () => void;
}

export function LegacyEditarInfoAdicionalModal({
  open,
  onOpenChange,
  initial,
  onSave,
  onCancel
}: LegacyEditarInfoAdicionalModalProps) {
  const isEdit = Boolean(initial?.id);

  const [info, setInfo] = useState(initial?.info || "");

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setInfo(initial?.info || "");
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="v2-overlay" onClick={handleClose}>
      <div className="v2-modal max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header border-b border-[#1a1a1a] pb-4 mb-4">
          <h2 className="text-xl font-bold font-[family-name:var(--font-rasputin)] text-[#F5F0EB] tracking-wide">
            Editar Información Adicional
          </h2>
          <button onClick={handleClose} className="text-[#8a8a8a] hover:text-[#C5A059] transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Información Adicional</label>
              <textarea
                className="app-input min-h-[120px]"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="Información adicional sobre la sucursal"
                rows={6}
              />
              <p className="text-[11px] text-[#555] mt-1">
                Puedes incluir detalles como políticas, servicios especiales, o cualquier otra información relevante.
              </p>
            </div>
          </div>

          <div className="v2-modal-footer flex gap-3 justify-end items-center mt-6 pt-4 border-t border-[#1a1a1a]">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-[14px] font-medium text-[#8a8a8a] hover:text-[#C5A059] transition-colors">
              Cancelar
            </button>
            <button type="submit" className="app-btn-primary">
              Actualizar Información
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}