import React, { useState, useEffect } from 'react';
import type { Sucursal } from "@/types/db";
import { toast } from "sonner";

interface LegacyEditarSucursalModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Sucursal>;
  onSave: (values: Partial<Sucursal>) => Promise<void>;
  onCancel?: () => void;
}

export function LegacyEditarSucursalModal({
  open,
  onOpenChange,
  initial,
  onSave,
  onCancel
}: LegacyEditarSucursalModalProps) {
  const isEdit = Boolean(initial?.id);

  const [formData, setFormData] = useState({
    nombre_sucursal: initial?.nombre_sucursal || "",
    telefono: initial?.telefono || "",
    direccion: initial?.direccion || "",
    info: initial?.info || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setFormData({
        nombre_sucursal: initial?.nombre_sucursal || "",
        telefono: initial?.telefono || "",
        direccion: initial?.direccion || "",
        info: initial?.info || ""
      });
      setErrors({});
    }
  }, [open, initial]);

  // Validar el formulario
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_sucursal.trim()) {
      newErrors.nombre_sucursal = "El nombre de la sucursal es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      console.log("Datos a enviar para guardar sucursal:", formData);
      // Guardar datos de la sucursal
      await onSave(formData);

      toast.success(isEdit ? "Sucursal actualizada" : "Sucursal creada");

      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar la sucursal");
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
            {isEdit ? "Editar Sucursal" : "Nueva Sucursal"}
          </h2>
          <button onClick={handleClose} className="text-[#8a8a8a] hover:text-[#C5A059] transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Nombre de la Sucursal <span className="text-[#C5A059]">*</span></label>
              <input
                type="text"
                className={`app-input ${errors.nombre_sucursal ? "border-red-500" : ""}`}
                value={formData.nombre_sucursal}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre_sucursal: e.target.value }))}
                placeholder="Nombre de la sucursal"
              />
              {errors.nombre_sucursal && <p className="text-red-500 text-xs mt-1">{errors.nombre_sucursal}</p>}
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Teléfono</label>
              <input
                type="text"
                className="app-input"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="Teléfono"
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Dirección</label>
              <input
                type="text"
                className="app-input"
                value={formData.direccion}
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                placeholder="Dirección completa"
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Información Adicional</label>
              <textarea
                className="app-input min-h-[80px]"
                value={formData.info}
                onChange={(e) => setFormData(prev => ({ ...prev, info: e.target.value }))}
                placeholder="Información adicional sobre la sucursal"
                rows={3}
              />
            </div>
          </div>

          <div className="v2-modal-footer flex gap-3 justify-end items-center mt-6 pt-4 border-t border-[#1a1a1a]">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-[14px] font-medium text-[#8a8a8a] hover:text-[#C5A059] transition-colors">
              Cancelar
            </button>
            <button type="submit" className="app-btn-primary">
              {isEdit ? "Actualizar" : "Crear sucursal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}