import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import type { Service, Barbero } from "@/types/db";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useActualizarEspecialidadesBarbero } from "@/hooks/useActualizarEspecialidadesBarbero";
import { Checkbox } from "./ui/app-checkbox";

// Tipo para la información de asignación de barbero
type BarberoAsignacionInfo = {
  barberoId: string;
  asignar: boolean;
  servicioId: string | undefined;
} | string | null;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Service>;
  onSave: (values: Omit<Service, "id_servicio" | "created_at" | "updated_at" | "activo"> | Partial<Service>) => Promise<void>;
  onCancel?: () => void;
  idBarberia?: string;
  idSucursal?: string;
  onBarberoSeleccionado?: (info: BarberoAsignacionInfo) => void;
};

export function LegacyServicioModal({
  open,
  onOpenChange,
  initial,
  onSave,
  onCancel,
  idBarberia,
  idSucursal,
  onBarberoSeleccionado
}: Props) {
  const isEdit = Boolean(initial?.id_servicio);

  const [formData, setFormData] = useState({
    nombre: initial?.nombre || "",
    precio: initial?.precio || 0,
    duracion_minutos: initial?.duracion_minutos || 30,
    descripcion: initial?.descripcion || "",
    barberoId: null as string | null
  });

  const [barberosAsignaciones, setBarberosAsignaciones] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Obtener barberos para la sucursal
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberosList(idBarberia, idSucursal);

  // Hook para actualizar especialidades de barbero
  const { mutateAsync: actualizarEspecialidades } = useActualizarEspecialidadesBarbero();

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setFormData({
        nombre: initial?.nombre || "",
        precio: initial?.precio || 0,
        duracion_minutos: initial?.duracion_minutos || 30,
        descripcion: initial?.descripcion || "",
        barberoId: null
      });
      setErrors({});

      // Inicializar las asignaciones de barberos para el modo edición
      if (isEdit && initial?.id_servicio) {
        const asignaciones: Record<string, boolean> = {};
        barberos?.forEach(barbero => {
          const tieneEspecialidad = barbero.especialidades?.includes(initial.id_servicio || '') || false;
          asignaciones[barbero.id_barbero] = tieneEspecialidad;
        });
        setBarberosAsignaciones(asignaciones);
      } else {
        setBarberosAsignaciones({});
      }
    }
  }, [open, initial, isEdit, barberos]);

  // Validar el formulario
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del servicio es obligatorio";
    }

    if (formData.precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0";
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
      const serviceData: any = {
        nombre: formData.nombre,
        precio: formData.precio,
        duracion_minutos: formData.duracion_minutos,
        descripcion: formData.descripcion || null
      };

      // Guardar el servicio
      await onSave(serviceData);

      // Notificar al componente padre sobre el barbero seleccionado
      if (onBarberoSeleccionado) {
        onBarberoSeleccionado(formData.barberoId);
      }

      toast.success(isEdit ? "Servicio actualizado" : "Servicio creado");
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar el servicio");
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
            {isEdit ? "Editar servicio" : "Nuevo servicio"}
          </h2>
          <button onClick={handleClose} type="button" className="text-[#8a8a8a] hover:text-[#C5A059] transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Nombre del Servicio <span className="text-[#C5A059]">*</span></label>
              <input
                type="text"
                className={`app-input ${errors.nombre ? "border-red-500" : ""}`}
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Corte de cabello"
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Precio ($) <span className="text-[#C5A059]">*</span></label>
                <input
                  type="number"
                  className={`app-input ${errors.precio ? "border-red-500" : ""}`}
                  value={formData.precio || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                  placeholder="Ej: 500"
                />
                {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Duración (minutos)</label>
                <input
                  type="number"
                  className="app-input"
                  value={formData.duracion_minutos || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, duracion_minutos: parseInt(e.target.value) || 0 }))}
                  placeholder="Ej: 30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Descripción</label>
              <input
                type="text"
                className="app-input"
                value={formData.descripcion || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción del servicio"
              />
            </div>

            {/* Selector de barbero para asignar/desasignar especialidad */}
            {barberos && barberos.length > 0 && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Barberos que ofrecen este servicio</label>
                <div className="border border-[#1a1a1a] bg-[#0a0a0a] rounded-lg p-3 max-h-40 overflow-y-auto custom-scrollbar">
                  <div className="space-y-3 pl-1 py-1">
                    {barberos.map((barbero) => {
                      const tieneEspecialidad = isEdit
                        ? barberosAsignaciones[barbero.id_barbero] !== undefined
                          ? barberosAsignaciones[barbero.id_barbero]
                          : barbero.especialidades?.includes(initial?.id_servicio || '') || false
                        : formData.barberoId === barbero.id_barbero;

                      return (
                        <Checkbox
                          key={barbero.id_barbero}
                          checked={tieneEspecialidad}
                          onChange={(e) => {
                            if (isEdit) {
                              setBarberosAsignaciones(prev => ({
                                ...prev,
                                [barbero.id_barbero]: e.target.checked
                              }));
                              if (onBarberoSeleccionado) {
                                onBarberoSeleccionado({
                                  barberoId: barbero.id_barbero,
                                  asignar: e.target.checked,
                                  servicioId: initial?.id_servicio
                                });
                              }
                            } else {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, barberoId: barbero.id_barbero }));
                                if (onBarberoSeleccionado) onBarberoSeleccionado(barbero.id_barbero);
                              } else {
                                setFormData(prev => ({ ...prev, barberoId: null }));
                                if (onBarberoSeleccionado) onBarberoSeleccionado(null);
                              }
                            }
                          }}
                          label={barbero.nombre}
                        />
                      );
                    })}
                  </div>
                </div>
                {isLoadingBarberos && (
                  <p className="text-[11px] text-[#555] mt-1">Cargando barberos...</p>
                )}
              </div>
            )}
          </div>

          <div className="v2-modal-footer flex gap-3 justify-end items-center mt-6 pt-4 border-t border-[#1a1a1a]">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-[14px] font-medium text-[#8a8a8a] hover:text-[#C5A059] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={!formData.nombre || formData.precio <= 0} className="app-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {isEdit ? "Actualizar" : "Crear servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}