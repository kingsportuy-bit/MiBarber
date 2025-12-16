import React from 'react';
import { 
  LegacyV2Modal, 
  LegacyV2FormSection, 
  LegacyV2FormGroup, 
  LegacyV2Label,
  LegacyV2Button,
  LegacyV2ModalFooter
} from './LegacyV2Modal';
import type { Client } from "@/types/db";

interface LegacyClientDetailModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client: Client;
}

export function LegacyClientDetailModal({ open, onOpenChange, client }: LegacyClientDetailModalProps) {
  // Función para formatear fecha
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No especificado";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-UY');
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <LegacyV2Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Ficha del Cliente"
    >
      <LegacyV2FormSection>
        <div className="grid grid-cols-1 gap-4">
          <LegacyV2FormGroup>
            <LegacyV2Label>Nombre</LegacyV2Label>
            <div className="text-qoder-dark-text-primary">{client.nombre || "No especificado"}</div>
          </LegacyV2FormGroup>
          
          <LegacyV2FormGroup>
            <LegacyV2Label>Celular</LegacyV2Label>
            <div className="text-qoder-dark-text-primary">{client.telefono || client.id_cliente || "No especificado"}</div>
          </LegacyV2FormGroup>
          
          <LegacyV2FormGroup>
            <LegacyV2Label>Email</LegacyV2Label>
            <div className="text-qoder-dark-text-primary">{(client as any).email || "No especificado"}</div>
          </LegacyV2FormGroup>
          
          <LegacyV2FormGroup>
            <LegacyV2Label>Fecha de Nacimiento</LegacyV2Label>
            <div className="text-qoder-dark-text-primary">{formatDate((client as any).fecha_nacimiento)}</div>
          </LegacyV2FormGroup>
          
          <LegacyV2FormGroup>
            <LegacyV2Label>Dirección</LegacyV2Label>
            <div className="text-qoder-dark-text-primary">{(client as any).direccion || "No especificado"}</div>
          </LegacyV2FormGroup>
          
          <LegacyV2FormGroup>
            <LegacyV2Label>Notas</LegacyV2Label>
            <div className="text-qoder-dark-text-primary">{client.notas || "No hay notas registradas"}</div>
          </LegacyV2FormGroup>
          
          <LegacyV2FormGroup>
            <LegacyV2Label>Puntaje</LegacyV2Label>
            <div className="text-qoder-dark-text-primary">{client.puntaje ?? "No especificado"}</div>
          </LegacyV2FormGroup>
          
          <LegacyV2FormGroup>
            <LegacyV2Label>Última Interacción</LegacyV2Label>
            <div className="text-qoder-dark-text-primary">{formatDate(client.ultima_interaccion)}</div>
          </LegacyV2FormGroup>
        </div>
      </LegacyV2FormSection>
      
      <LegacyV2ModalFooter>
        <LegacyV2Button 
          type="button" 
          variant="secondary" 
          onClick={() => onOpenChange(false)}
        >
          Cerrar
        </LegacyV2Button>
      </LegacyV2ModalFooter>
    </LegacyV2Modal>
  );
}