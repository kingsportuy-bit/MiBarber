"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { Client } from "@/types/db";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client: Client;
};

export function ClientDetailModal({ open, onOpenChange, client }: Props) {
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="v2-overlay" />
        <Dialog.Content className="v2-modal" aria-describedby={undefined}>
          <div className="v2-modal-header">
            <Dialog.Title className="v2-modal-title">
              Ficha del Cliente
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-qoder-dark-text-secondary mb-1">Nombre</h3>
                  <p className="text-qoder-dark-text-primary">{client.nombre || "No especificado"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-qoder-dark-text-secondary mb-1">Celular</h3>
                  <p className="text-qoder-dark-text-primary">{client.telefono || client.id_cliente || "No especificado"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-qoder-dark-text-secondary mb-1">Email</h3>
                  <p className="text-qoder-dark-text-primary">{(client as any).email || "No especificado"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-qoder-dark-text-secondary mb-1">Fecha de Nacimiento</h3>
                  <p className="text-qoder-dark-text-primary">{formatDate((client as any).fecha_nacimiento)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-qoder-dark-text-secondary mb-1">Dirección</h3>
                  <p className="text-qoder-dark-text-primary">{(client as any).direccion || "No especificado"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-qoder-dark-text-secondary mb-1">Notas</h3>
                  <p className="text-qoder-dark-text-primary">{client.notas || "No hay notas registradas"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-qoder-dark-text-secondary mb-1">Puntaje</h3>
                  <p className="text-qoder-dark-text-primary">{client.puntaje ?? "No especificado"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-qoder-dark-text-secondary mb-1">Última Interacción</h3>
                  <p className="text-qoder-dark-text-primary">{formatDate(client.ultima_interaccion)}</p>
                </div>
              </div>
            </div>
            <div className="v2-modal-footer">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="v2-btn v2-btn-secondary"
              >
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}