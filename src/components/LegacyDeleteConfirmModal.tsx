import React from 'react';
import { 
  LegacyV2Modal, 
  LegacyV2FormSection, 
  LegacyV2FormGroup,
  LegacyV2Button,
  LegacyV2ModalFooter
} from './LegacyV2Modal';
import type { Client } from "@/types/db";

interface LegacyDeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client: Client | null;
  onConfirm: () => void;
}

export function LegacyDeleteConfirmModal({ 
  open, 
  onOpenChange, 
  client, 
  onConfirm 
}: LegacyDeleteConfirmModalProps) {
  if (!client) return null;

  return (
    <LegacyV2Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Confirmar eliminación"
    >
      <LegacyV2FormSection>
        <LegacyV2FormGroup>
          <p className="text-[var(--text-secondary)] mb-4">
            ¿Estás seguro que quieres eliminar al cliente{" "}
            <strong className="text-[var(--text-primary)]">
              {client.nombre}
            </strong>
            ?
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-6">
            Celular: {client.telefono || "Sin teléfono"}
          </p>
        </LegacyV2FormGroup>
      </LegacyV2FormSection>
      
      <LegacyV2ModalFooter>
        <LegacyV2Button 
          type="button" 
          variant="secondary" 
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </LegacyV2Button>
        <LegacyV2Button 
          type="button" 
          variant="danger" 
          onClick={onConfirm}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>Eliminar</span>
        </LegacyV2Button>
      </LegacyV2ModalFooter>
    </LegacyV2Modal>
  );
}