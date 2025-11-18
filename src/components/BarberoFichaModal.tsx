"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import type { Barbero } from "@/types/db";
import { useServiciosList } from "@/hooks/useServiciosList";
import { BarberoNivelPermisos } from "@/components/BarberoNivelPermisos";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barbero: Barbero | null;
  idBarberia?: string;
};

export function BarberoFichaModal({ open, onOpenChange, barbero, idBarberia }: Props) {
  const serviciosQuery = useServiciosList(idBarberia);
  
  // Función para obtener el nombre del servicio por su ID
  const getNombreServicio = (servicioId: string) => {
    if (serviciosQuery.data) {
      const servicio = serviciosQuery.data.find((s: any) => s.id_servicio === servicioId);
      return servicio ? servicio.nombre : servicioId;
    }
    return servicioId;
  };

  if (!barbero) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 qoder-dark-modal-overlay-global" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-h-[90vh] overflow-y-auto">
          <div className="qoder-dark-client-modal max-w-md w-[90vw]">
            <div className="qoder-dark-window-header">
              <Dialog.Title className="text-lg font-semibold text-qoder-dark-text-primary">
                Ficha del Barbero
              </Dialog.Title>
            </div>
            <div className="content space-y-4">
              {/* Información básica */}
              <div className="bg-qoder-dark-bg-form rounded-lg p-4">
                <h3 className="font-semibold text-qoder-dark-text-primary mb-3">Información Básica</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-qoder-dark-text-secondary">Nombre</label>
                    <p className="text-qoder-dark-text-primary">{barbero.nombre}</p>
                  </div>
                  <div>
                    <label className="text-xs text-qoder-dark-text-secondary">Nombre de Usuario</label>
                    <p className="text-qoder-dark-text-primary">{barbero.username || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-qoder-dark-text-secondary">Teléfono</label>
                    <p className="text-qoder-dark-text-primary">{barbero.telefono || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-qoder-dark-text-secondary">Email</label>
                    <p className="text-qoder-dark-text-primary">{barbero.email || "No especificado"}</p>
                  </div>
                </div>
              </div>

              {/* Rol y Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-qoder-dark-bg-form rounded-lg p-4">
                  <h3 className="font-semibold text-qoder-dark-text-primary mb-3">Rol</h3>
                  <BarberoNivelPermisos 
                    barbero={barbero} 
                    onUpdate={() => {}}
                    readonly={true}
                  />
                </div>
                <div className="bg-qoder-dark-bg-form rounded-lg p-4">
                  <h3 className="font-semibold text-qoder-dark-text-primary mb-3">Estado</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    barbero.activo 
                      ? "bg-green-900 text-green-300" 
                      : "bg-red-900 text-red-300"
                  }`}>
                    {barbero.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Especialidades */}
              <div className="bg-qoder-dark-bg-form rounded-lg p-4">
                <h3 className="font-semibold text-qoder-dark-text-primary mb-3">Especialidades</h3>
                {barbero.especialidades && barbero.especialidades.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {barbero.especialidades.map((esp: string, index: number) => (
                      <span 
                        key={index} 
                        className="bg-qoder-dark-accent-primary/20 text-qoder-dark-accent-primary px-3 py-1 rounded-full text-sm"
                      >
                        {getNombreServicio(esp)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-qoder-dark-text-secondary">No tiene especialidades asignadas</p>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-qoder-dark-bg-form rounded-lg p-4">
                <h3 className="font-semibold text-qoder-dark-text-primary mb-3">Información Adicional</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-qoder-dark-text-secondary">Fecha de Creación</label>
                    <p className="text-qoder-dark-text-primary">
                      {barbero.created_at 
                        ? new Date(barbero.created_at).toLocaleDateString('es-ES') 
                        : "No especificada"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-qoder-dark-text-secondary">Última Actualización</label>
                    <p className="text-qoder-dark-text-primary">
                      {barbero.updated_at 
                        ? new Date(barbero.updated_at).toLocaleDateString('es-ES') 
                        : "No especificada"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 p-4 pt-0">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="action-button"
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