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
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 z-50 h-[90vh] max-h-[600px]">
          <div className="qoder-dark-card h-full flex flex-col">
            <div className="qoder-dark-window-header">
              <Dialog.Title className="text-lg font-semibold text-qoder-dark-text-primary">
                Ficha del Cliente
              </Dialog.Title>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-grow">
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
            <div className="mt-4 flex justify-end gap-2 p-4 pt-0">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="qoder-dark-button px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
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