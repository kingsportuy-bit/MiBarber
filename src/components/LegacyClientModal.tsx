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
    const normalizedData = {
      ...formData,
      telefono: formData.telefono ? normalizePhoneNumber(formData.telefono) : undefined
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

  return (
    <LegacyV2Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar cliente" : "Nuevo cliente"}
    >
      <LegacyV2Form onSubmit={handleSubmit}>
        <LegacyV2FormSection>
          <div className="v2-form-grid">
            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="telefono">Celular</LegacyV2Label>
              <LegacyV2Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="Ej: 099123456"
              />
            </LegacyV2FormGroup>
            
            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="nombre">Nombre *</LegacyV2Label>
              <LegacyV2Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Nombre completo del cliente"
                required
              />
            </LegacyV2FormGroup>
            
            {/* Campos adicionales - solo se muestran en modo edición */}
            {isEdit && (
              <>
                <LegacyV2FormGroup>
                  <LegacyV2Label htmlFor="email">Email (Opcional)</LegacyV2Label>
                  <LegacyV2Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </LegacyV2FormGroup>
                
                <LegacyV2FormGroup>
                  <LegacyV2Label htmlFor="fecha_nacimiento">Fecha de Nacimiento (Opcional)</LegacyV2Label>
                  <LegacyV2Input
                    id="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                  />
                </LegacyV2FormGroup>
                
                <LegacyV2FormGroup className="full-width">
                  <LegacyV2Label htmlFor="direccion">Dirección (Opcional)</LegacyV2Label>
                  <LegacyV2Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Dirección completa"
                  />
                </LegacyV2FormGroup>
              </>
            )}
            
            <LegacyV2FormGroup className="full-width">
              <LegacyV2Label htmlFor="notas">Notas</LegacyV2Label>
              <LegacyV2Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => handleChange('notas', e.target.value)}
                placeholder="Notas sobre el cliente..."
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
            {isEdit ? "Actualizar" : "Crear cliente"}
          </LegacyV2Button>
        </LegacyV2ModalFooter>
      </LegacyV2Form>
    </LegacyV2Modal>
  );
}