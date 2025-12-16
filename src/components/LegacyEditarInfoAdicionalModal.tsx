import React, { useState, useEffect } from 'react';
import { 
  LegacyV2Modal, 
  LegacyV2Form, 
  LegacyV2FormSection, 
  LegacyV2FormGroup, 
  LegacyV2Label, 
  LegacyV2Textarea,
  LegacyV2Button,
  LegacyV2ModalFooter
} from './LegacyV2Modal';
import type { Sucursal } from "@/types/db";
import { toast } from "sonner";

interface LegacyEditarInfoAdicionalModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Sucursal>;
  onSave: (values: Partial<Sucursal>) => Promise<void>;
  onCancel?: () => void;
}

export function LegacyEditarInfoAdicionalModal({ 
  open, 
  onOpenChange, 
  initial, 
  onSave, 
  onCancel 
}: LegacyEditarInfoAdicionalModalProps) {
  const isEdit = Boolean(initial?.id);
  
  const [info, setInfo] = useState(initial?.info || "");
  
  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setInfo(initial?.info || "");
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Verificar que se tenga un ID válido antes de intentar actualizar
      if (!initial?.id) {
        throw new Error("No se puede actualizar la información adicional sin un ID de sucursal válido");
      }
      
      const sucursalData = {
        id: initial.id, // Incluir el ID para actualizar la sucursal existente
        info,
      };
      
      console.log("Datos a enviar para guardar información adicional:", sucursalData);
      // Guardar solo la información adicional
      await onSave(sucursalData);
      
      toast.success("Información adicional actualizada");
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error(`Error al guardar la información adicional: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
      title="Editar Información Adicional"
    >
      <LegacyV2Form onSubmit={handleSubmit}>
        <LegacyV2FormSection>
          <div className="grid grid-cols-1 gap-4">
            {/* Campo para información adicional */}
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Información Adicional</LegacyV2Label>
              <LegacyV2Textarea 
                value={info} 
                onChange={(e) => setInfo(e.target.value)} 
                placeholder="Información adicional sobre la sucursal"
                rows={6}
              />
              <p className="text-[var(--text-secondary)] text-xs mt-1">
                Puedes incluir detalles como políticas, servicios especiales, o cualquier otra información relevante.
              </p>
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
            Actualizar Información
          </LegacyV2Button>
        </LegacyV2ModalFooter>
      </LegacyV2Form>
    </LegacyV2Modal>
  );
}