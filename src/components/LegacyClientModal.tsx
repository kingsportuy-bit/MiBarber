import React, { useState, useEffect } from 'react';
import {
  LegacyV2Modal,
  LegacyV2Form,
  LegacyV2FormSection,
  LegacyV2FormGroup,
  LegacyV2Label,
  LegacyV2Input,
  LegacyV2Textarea,
  LegacyV2Button,
  LegacyV2ModalFooter
} from './LegacyV2Modal';
import type { Client } from "@/types/db";
import { normalizePhoneNumber, isValidPhoneNumber } from "@/shared/utils/phoneUtils";

interface LegacyClientModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Client>;
  onSave: (values: Partial<Client>) => Promise<void>;
  editOnly?: boolean;
}

export function LegacyClientModal({
  open,
  onOpenChange,
  initial,
  onSave,
  editOnly = false
}: LegacyClientModalProps) {
  const isEdit = Boolean(initial?.id_cliente);

  const [formData, setFormData] = useState({
    nombre: initial?.nombre || "",
    telefono: initial?.telefono || "",
    notas: initial?.notas || "",
    email: (initial as any)?.email || "",
    fecha_nacimiento: (initial as any)?.fecha_nacimiento || "",
    direccion: (initial as any)?.direccion || ""
  });

  useEffect(() => {
    if (initial) {
      setFormData({
        nombre: initial.nombre || "",
        telefono: initial.telefono || "",
        notas: initial.notas || "",
        email: (initial as any)?.email || "",
        fecha_nacimiento: (initial as any)?.fecha_nacimiento || "",
        direccion: (initial as any)?.direccion || ""
      });
    }
  }, [initial]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar el formato del número de teléfono si se ingresó uno
    if (formData.telefono && !isValidPhoneNumber(formData.telefono)) {
      alert("El formato del número de celular debe ser: 09xxxxxxx o +5989xxxxxxx");
      return;
    }

    // Normalizar el número de teléfono antes de guardar
    // y convertir strings vacíos a null para evitar errores de tipo en la DB (especialmente fechas)
    const normalizedData = {
      ...formData,
      id_cliente: initial?.id_cliente,
      telefono: formData.telefono ? normalizePhoneNumber(formData.telefono) : null,
      email: formData.email || null,
      fecha_nacimiento: formData.fecha_nacimiento || null,
      direccion: formData.direccion || null,
      notas: formData.notas || null
    };

    try {
      await onSave(normalizedData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el cliente");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="v2-overlay" onClick={handleClose}>
      <div className="v2-modal max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header border-b border-[#1a1a1a] pb-4 mb-4">
          <h2 className="text-xl font-bold font-[family-name:var(--font-rasputin)] text-[#F5F0EB] tracking-wide">
            {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#8a8a8a] hover:text-[#C5A059] transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="nombre" className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                  Nombre *
                </label>
                <input
                  id="nombre"
                  type="text"
                  className="app-input"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Nombre completo..."
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="telefono" className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                  Celular
                </label>
                <input
                  id="telefono"
                  type="tel"
                  className="app-input"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="099 123 456"
                />
              </div>
            </div>

            {/* Campos adicionales - solo se muestran en modo edición */}
            {isEdit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="email" className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                    Email (Opcional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="app-input"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="fecha_nacimiento" className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                    Nacimiento (Opcional)
                  </label>
                  <input
                    id="fecha_nacimiento"
                    type="date"
                    className="app-input"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full sm:col-span-2">
                  <label htmlFor="direccion" className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                    Dirección (Opcional)
                  </label>
                  <input
                    id="direccion"
                    type="text"
                    className="app-input"
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Dirección completa..."
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="notas" className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                Notas
              </label>
              <textarea
                id="notas"
                className="app-input min-h-[80px] resize-none"
                value={formData.notas}
                onChange={(e) => handleChange('notas', e.target.value)}
                placeholder="Notas sobre el cliente o preferencias..."
                rows={3}
              />
            </div>
          </div>

          <div className="v2-modal-footer flex gap-3 justify-end items-center mt-6 pt-4 border-t border-[#1a1a1a]">
            <button
              type="button"
              className="px-4 py-2 text-[14px] font-medium text-[#8a8a8a] hover:text-[#C5A059] transition-colors"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button type="submit" className="app-btn-primary">
              {isEdit ? "Actualizar" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}