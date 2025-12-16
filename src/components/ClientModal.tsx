"use client";

import { useEffect } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { useFormData } from "@/hooks/useFormData";
import type { Client } from "@/types/db";
import { CustomDatePicker } from "@/components/CustomDatePicker";

import { normalizePhoneNumber, isValidPhoneNumber } from "@/shared/utils/phoneUtils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Client>;
  onSave: (values: Partial<Client>) => Promise<void>;
  editOnly?: boolean; // Si es true, solo permite editar campos específicos
};

export function ClientModal({
  open,
  onOpenChange,
  initial,
  onSave,
  editOnly = false,
}: Props) {
  const isEdit = Boolean(initial?.id_cliente);
  const { values, update } = useFormData<Client>(initial, open, !isEdit);

  // Función para manejar el cambio en el campo de teléfono
  const handlePhoneChange = (value: string) => {
    update("telefono", value);
  };



  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="v2-overlay" />
        <Dialog.Content className="v2-modal" aria-describedby={undefined}>
          <div className="v2-modal-header">
            <Dialog.Title className="v2-modal-title">
              {isEdit ? "Editar cliente" : "Nuevo cliente"}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="v2-label">
                  Celular
                </label>
                <input
                  className="v2-input"
                  value={values.telefono || ""}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Ej: 099123456"
                />
              </div>
              <div className="col-span-2">
                <label className="v2-label">
                  Nombre
                </label>
                <input
                  className="v2-input"
                  value={values.nombre || ""}
                  onChange={(e) => update("nombre", e.target.value)}
                  placeholder="Nombre completo del cliente"
                />
              </div>

              {/* Campos adicionales - solo se muestran en modo edición */}
              {isEdit && (
                <>
                  <div className="col-span-2">
                    <label className="v2-label">
                      Email (Opcional)
                    </label>
                    <input
                      className="v2-input"
                      value={(values as any).email || ""}
                      onChange={(e) => update("email" as any, e.target.value)}
                      placeholder="correo@ejemplo.com"
                      type="email"
                    />
                  </div>

                  <div>
                    <label className="v2-label">
                      Fecha de Nacimiento (Opcional)
                    </label>
                    <CustomDatePicker
                      value={(values as any).fecha_nacimiento || ""}
                      onChange={(date: string) =>
                        update("fecha_nacimiento" as any, date)
                      }
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="v2-label">
                      Dirección (Opcional)
                    </label>
                    <input
                      className="v2-input"
                      value={(values as any).direccion || ""}
                      onChange={(e) =>
                        update("direccion" as any, e.target.value)
                      }
                      placeholder="Dirección completa"
                    />
                  </div>
                </>
              )}

              <div className="col-span-2">
                <label className="v2-label">
                  Notas
                </label>
                <textarea
                  className="v2-textarea"
                  value={values.notas || ""}
                  onChange={(e) => update("notas", e.target.value)}
                  placeholder="Notas sobre el cliente..."
                />
              </div>
            </div>
            <div className="v2-modal-footer">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="v2-btn v2-btn-secondary"
              >
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  // Validar el formato del número de teléfono si se ingresó uno
                  if (values.telefono && !isValidPhoneNumber(values.telefono)) {
                    alert("El formato del número de celular debe ser: 09xxxxxxx o +5989xxxxxxx");
                    return;
                  }
                  
                  // Normalizar el número de teléfono antes de guardar
                  const normalizedValues = {
                    ...values,
                    telefono: values.telefono ? normalizePhoneNumber(values.telefono) : undefined
                  };
                  await onSave(normalizedValues);
                }}
                className="v2-btn v2-btn-primary"
              >
                <span>{isEdit ? "Actualizar" : "Crear cliente"}</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
