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
        <Dialog.Overlay className="v2-overlay" />
        <Dialog.Content className="v2-modal" style={{ maxWidth: '500px' }}>
          <div className="v2-modal-header">
            <Dialog.Title className="v2-modal-title">
              Ficha del Barbero
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
              {/* Información básica */}
              <div className="bg-[var(--bg-form)] rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Información Básica</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-[var(--text-secondary)]">Nombre</label>
                    <p className="text-[var(--text-primary)]">{barbero.nombre}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)]">Nombre de Usuario</label>
                    <p className="text-[var(--text-primary)]">{barbero.username || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)]">Teléfono</label>
                    <p className="text-[var(--text-primary)]">{barbero.telefono || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)]">Email</label>
                    <p className="text-[var(--text-primary)]">{barbero.email || "No especificado"}</p>
                  </div>
                </div>
              </div>
              
              {/* Rol y Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--bg-form)] rounded-lg p-4">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-3">Rol</h3>
                  <BarberoNivelPermisos 
                    barbero={barbero} 
                    onUpdate={() => {}}
                    readonly={true}
                  />
                </div>
                <div className="bg-[var(--bg-form)] rounded-lg p-4">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-3">Estado</h3>
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
              <div className="bg-[var(--bg-form)] rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Especialidades</h3>
                {barbero.especialidades && barbero.especialidades.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {barbero.especialidades.map((esp: string, index: number) => (
                      <span 
                        key={index} 
                        className="bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] px-3 py-1 rounded-full text-sm"
                      >
                        {getNombreServicio(esp)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)]">No tiene especialidades asignadas</p>
                )}
              </div>
              
              {/* Información adicional */}
              <div className="bg-[var(--bg-form)] rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Información Adicional</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-[var(--text-secondary)]">Fecha de Creación</label>
                    <p className="text-[var(--text-primary)]">
                      {barbero.created_at 
                        ? new Date(barbero.created_at).toLocaleDateString('es-ES') 
                        : "No especificada"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)]">Última Actualización</label>
                    <p className="text-[var(--text-primary)]">
                      {barbero.updated_at 
                        ? new Date(barbero.updated_at).toLocaleDateString('es-ES') 
                        : "No especificada"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="v2-modal-footer">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="v2-btn v2-btn-primary"
            >
              Cerrar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}