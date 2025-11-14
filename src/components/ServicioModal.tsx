"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Service, Barbero } from "@/types/db";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useActualizarEspecialidadesBarbero } from "@/hooks/useActualizarEspecialidadesBarbero";

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

export function ServicioModal({ open, onOpenChange, initial, onSave, onCancel, idBarberia, idSucursal, onBarberoSeleccionado }: Props) {
  const isEdit = Boolean(initial?.id_servicio);
  
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [precio, setPrecio] = useState(initial?.precio || 0);
  const [duracion_minutos, setDuracionMinutos] = useState(initial?.duracion_minutos || 30);
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [barberoId, setBarberoId] = useState<string | null>(null);
  const [barberosAsignaciones, setBarberosAsignaciones] = useState<Record<string, boolean>>({});
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Obtener barberos para la sucursal
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberosList(idBarberia, idSucursal);
  
  // Hook para actualizar especialidades de barbero
  const { mutateAsync: actualizarEspecialidades } = useActualizarEspecialidadesBarbero();

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setNombre(initial?.nombre || "");
      setPrecio(initial?.precio || 0);
      setDuracionMinutos(initial?.duracion_minutos || 30);
      setDescripcion(initial?.descripcion || "");
      setBarberoId(null);
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
    
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre del servicio es obligatorio";
    }
    
    if (precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    try {
      const serviceData: any = {
        nombre,
        precio,
        duracion_minutos,
        descripcion: descripcion || null
      };
      
      // Guardar el servicio
      await onSave(serviceData);
      
      // Notificar al componente padre sobre el barbero seleccionado
      if (onBarberoSeleccionado) {
        onBarberoSeleccionado(barberoId);
      }
      
      toast.success(isEdit ? "Servicio actualizado" : "Servicio creado");
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar el servicio");
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
                {isEdit ? "Editar servicio" : "Nuevo servicio"}
              </Dialog.Title>
            </div>
            <div className="content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Nombre del Servicio</label>
                <input 
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.nombre ? "border-red-500" : ""}`} 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  placeholder="Ej: Corte de cabello"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs text-qoder-dark-text-secondary">Precio ($)</label>
                <input 
                  type="number"
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.precio ? "border-red-500" : ""}`} 
                  value={precio || ""} 
                  onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)} 
                  placeholder="Ej: 500"
                  min="0"
                  step="10"
                />
                {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs text-qoder-dark-text-secondary">Duración (minutos)</label>
                <input 
                  type="number"
                  className="w-full qoder-dark-input p-3 rounded-lg" 
                  value={duracion_minutos || ""} 
                  onChange={(e) => setDuracionMinutos(parseInt(e.target.value) || 0)} 
                  placeholder="Ej: 30"
                  min="5"
                  step="5"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Descripción</label>
                <input 
                  className="w-full qoder-dark-input p-3 rounded-lg" 
                  value={descripcion || ""} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  placeholder="Descripción del servicio"
                />
              </div>
              
              {/* Selector de barbero para asignar/desasignar especialidad */}
              {barberos && barberos.length > 0 && (
                <div className="col-span-2">
                  <label className="text-xs text-qoder-dark-text-secondary">Barberos que ofrecen este servicio</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-qoder-dark-bg-secondary rounded-lg">
                    {barberos.map((barbero) => {
                      // Verificar si este barbero ya tiene este servicio en sus especialidades
                      const tieneEspecialidad = isEdit 
                        ? barberosAsignaciones[barbero.id_barbero] !== undefined 
                          ? barberosAsignaciones[barbero.id_barbero]
                          : barbero.especialidades?.includes(initial?.id_servicio || '') || false
                        : barberoId === barbero.id_barbero;
                      
                      return (
                        <div key={barbero.id_barbero} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`barbero-${barbero.id_barbero}`}
                            checked={tieneEspecialidad}
                            onChange={(e) => {
                              if (isEdit) {
                                // En modo edición, actualizar el estado local y notificar al componente padre
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
                                // En modo creación, solo permitir seleccionar un barbero
                                if (e.target.checked) {
                                  setBarberoId(barbero.id_barbero);
                                  if (onBarberoSeleccionado) {
                                    onBarberoSeleccionado(barbero.id_barbero);
                                  }
                                } else {
                                  setBarberoId(null);
                                  if (onBarberoSeleccionado) {
                                    onBarberoSeleccionado(null);
                                  }
                                }
                              }
                            }}
                            className="mr-2 h-4 w-4 text-qoder-dark-accent-primary rounded"
                          />
                          <label htmlFor={`barbero-${barbero.id_barbero}`} className="text-sm text-qoder-dark-text-primary">
                            {barbero.nombre}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {isLoadingBarberos && (
                    <p className="text-xs text-qoder-dark-text-secondary mt-1">Cargando barberos...</p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2 p-4 pt-0">
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
                disabled={!nombre || precio <= 0}
              >
                <span>{isEdit ? "Actualizar" : "Crear servicio"}</span>
              </button>
            </div>
          </div>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}