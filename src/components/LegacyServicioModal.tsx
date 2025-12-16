import React, { useState, useEffect } from 'react';
import { 
  LegacyV2Modal, 
  LegacyV2Form, 
  LegacyV2FormSection, 
  LegacyV2FormGroup, 
  LegacyV2Label, 
  LegacyV2Input, 
  LegacyV2Button,
  LegacyV2ModalFooter
} from './LegacyV2Modal';
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

  return (
    <LegacyV2Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar servicio" : "Nuevo servicio"}
    >
      <LegacyV2Form onSubmit={handleSubmit}>
        <LegacyV2FormSection>
          <div className="v2-form-grid">
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Nombre del Servicio *</LegacyV2Label>
              <LegacyV2Input 
                value={formData.nombre} 
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} 
                placeholder="Ej: Corte de cabello"
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </LegacyV2FormGroup>
            
            <LegacyV2FormGroup className="col-span-2 md:col-span-1">
              <LegacyV2Label>Precio ($) *</LegacyV2Label>
              <LegacyV2Input 
                type="number"
                value={formData.precio || ""} 
                onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))} 
                placeholder="Ej: 500"
                className={errors.precio ? "border-red-500" : ""}
              />
              {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
            </LegacyV2FormGroup>
            
            <LegacyV2FormGroup className="col-span-2 md:col-span-1">
              <LegacyV2Label>Duración (minutos)</LegacyV2Label>
              <LegacyV2Input 
                type="number"
                value={formData.duracion_minutos || ""} 
                onChange={(e) => setFormData(prev => ({ ...prev, duracion_minutos: parseInt(e.target.value) || 0 }))} 
                placeholder="Ej: 30"
              />
            </LegacyV2FormGroup>
            
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Descripción</LegacyV2Label>
              <LegacyV2Input 
                value={formData.descripcion || ""} 
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))} 
                placeholder="Descripción del servicio"
              />
            </LegacyV2FormGroup>
            
            {/* Selector de barbero para asignar/desasignar especialidad */}
            {barberos && barberos.length > 0 && (
              <LegacyV2FormGroup className="col-span-2">
                <LegacyV2Label>Barberos que ofrecen este servicio</LegacyV2Label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-[var(--bg-secondary)] rounded-lg">
                  {barberos.map((barbero) => {
                    // Verificar si este barbero ya tiene este servicio en sus especialidades
                    const tieneEspecialidad = isEdit 
                      ? barberosAsignaciones[barbero.id_barbero] !== undefined 
                        ? barberosAsignaciones[barbero.id_barbero]
                        : barbero.especialidades?.includes(initial?.id_servicio || '') || false
                      : formData.barberoId === barbero.id_barbero;
                    
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
                                setFormData(prev => ({ ...prev, barberoId: barbero.id_barbero }));
                                if (onBarberoSeleccionado) {
                                  onBarberoSeleccionado(barbero.id_barbero);
                                }
                              } else {
                                setFormData(prev => ({ ...prev, barberoId: null }));
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
              </LegacyV2FormGroup>
            )}
          </div>
        </LegacyV2FormSection>
        
        <LegacyV2ModalFooter>
          <LegacyV2Button 
            type="button" 
            variant="secondary" 
            onClick={handleClose}
          >
            Cancelar
          </LegacyV2Button>
          <LegacyV2Button 
            type="submit" 
            variant="primary"
            disabled={!formData.nombre || formData.precio <= 0}
          >
            {isEdit ? "Actualizar" : "Crear servicio"}
          </LegacyV2Button>
        </LegacyV2ModalFooter>
      </LegacyV2Form>
    </LegacyV2Modal>
  );
}