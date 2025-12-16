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

  return (
    <LegacyV2Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar sucursal" : "Nueva sucursal"}
    >
      <LegacyV2Form onSubmit={handleSubmit}>
        <LegacyV2FormSection>
          <div className="v2-form-grid">
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Nombre de la Sucursal *</LegacyV2Label>
              <LegacyV2Input 
                value={formData.nombre_sucursal} 
                onChange={(e) => setFormData(prev => ({ ...prev, nombre_sucursal: e.target.value }))} 
                placeholder="Nombre de la sucursal"
                className={errors.nombre_sucursal ? "border-red-500" : ""}
              />
              {errors.nombre_sucursal && <p className="text-red-500 text-xs mt-1">{errors.nombre_sucursal}</p>}
            </LegacyV2FormGroup>
            
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Teléfono</LegacyV2Label>
              <LegacyV2Input 
                value={formData.telefono} 
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} 
                placeholder="Teléfono"
              />
            </LegacyV2FormGroup>
            
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Dirección</LegacyV2Label>
              <LegacyV2Input 
                value={formData.direccion} 
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))} 
                placeholder="Dirección completa"
              />
            </LegacyV2FormGroup>
            
            {/* Campo para información adicional */}
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Información Adicional</LegacyV2Label>
              <LegacyV2Textarea 
                value={formData.info} 
                onChange={(e) => setFormData(prev => ({ ...prev, info: e.target.value }))} 
                placeholder="Información adicional sobre la sucursal"
                rows={3}
              />
            </LegacyV2FormGroup>
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
          <LegacyV2Button type="submit" variant="primary">
            {isEdit ? "Actualizar" : "Crear sucursal"}
          </LegacyV2Button>
        </LegacyV2ModalFooter>
      </LegacyV2Form>
    </LegacyV2Modal>
  );
}