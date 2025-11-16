"use client";

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
        <Dialog.Overlay className="fixed inset-0 qoder-dark-modal-overlay-global" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="qoder-dark-client-modal">
            <div className="qoder-dark-window-header">
              <Dialog.Title className="text-lg font-semibold text-qoder-dark-text-primary">
                {isEdit ? "Editar cliente" : "Nuevo cliente"}
              </Dialog.Title>
            </div>
            <div className="content">
              <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">
                  Celular
                </label>
                <input
                  className="w-full qoder-dark-input p-3 rounded-lg"
                  value={values.telefono || ""}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Ej: 099123456"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">
                  Nombre
                </label>
                <input
                  className="w-full qoder-dark-input p-3 rounded-lg"
                  value={values.nombre || ""}
                  onChange={(e) => update("nombre", e.target.value)}
                  placeholder="Nombre completo del cliente"
                />
              </div>

              {/* Campos adicionales - solo se muestran en modo edición */}
              {isEdit && (
                <>
                  <div className="col-span-2">
                    <label className="text-xs text-qoder-dark-text-secondary">
                      Email (Opcional)
                    </label>
                    <input
                      className="w-full qoder-dark-input p-3 rounded-lg"
                      value={(values as any).email || ""}
                      onChange={(e) => update("email" as any, e.target.value)}
                      placeholder="correo@ejemplo.com"
                      type="email"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-qoder-dark-text-secondary">
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
                    <label className="text-xs text-qoder-dark-text-secondary">
                      Dirección (Opcional)
                    </label>
                    <input
                      className="w-full qoder-dark-input p-3 rounded-lg"
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
                <label className="text-xs text-qoder-dark-text-secondary">
                  Notas
                </label>
                <textarea
                  className="w-full qoder-dark-input p-3 h-24 rounded-lg"
                  value={values.notas || ""}
                  onChange={(e) => update("notas", e.target.value)}
                  placeholder="Notas sobre el cliente..."
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 p-4 pt-0">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="cancel-button"
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
                className="action-button"
              >
                <span>{isEdit ? "Actualizar" : "Crear cliente"}</span>
              </button>
            </div>
          </div>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
