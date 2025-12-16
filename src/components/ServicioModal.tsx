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
        <Dialog.Overlay className="v2-overlay" />
        <Dialog.Content className="v2-modal" style={{ maxWidth: '600px' }}>
          <div className="v2-modal-header">
            <Dialog.Title className="v2-modal-title">
              {isEdit ? "Editar servicio" : "Nuevo servicio"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="v2-label">Nombre del Servicio</label>
                <input 
                  className={`v2-input ${errors.nombre ? "border-red-500" : ""}`} 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  placeholder="Ej: Corte de cabello"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="v2-label">Precio ($)</label>
                <input 
                  type="number"
                  className={`v2-input ${errors.precio ? "border-red-500" : ""}`} 
                  value={precio || ""} 
                  onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)} 
                  placeholder="Ej: 500"
                  min="0"
                  step="10"
                />
                {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="v2-label">Duración (minutos)</label>
                <input 
                  type="number"
                  className="v2-input" 
                  value={duracion_minutos || ""} 
                  onChange={(e) => setDuracionMinutos(parseInt(e.target.value) || 0)} 
                  placeholder="Ej: 30"
                  min="5"
                  step="5"
                />
              </div>
              
              <div className="col-span-2">
                <label className="v2-label">Descripción</label>
                <input 
                  className="v2-input" 
                  value={descripcion || ""} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  placeholder="Descripción del servicio"
                />
              </div>
              
              {/* Selector de barbero para asignar/desasignar especialidad */}
              {barberos && barberos.length > 0 && (
                <div className="col-span-2">
                  <label className="v2-label">Barberos que ofrecen este servicio</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-[var(--bg-secondary)] rounded-lg">
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
                            className="mr-2 h-4 w-4 text-[var(--accent-primary)] rounded"
                          />
                          <label htmlFor={`barbero-${barbero.id_barbero}`} className="text-sm text-[var(--text-primary)]">
                            {barbero.nombre}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {isLoadingBarberos && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Cargando barberos...</p>
                  )}
                </div>
              )}
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
              disabled={!nombre || precio <= 0}
            >
              {isEdit ? "Actualizar" : "Crear servicio"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
