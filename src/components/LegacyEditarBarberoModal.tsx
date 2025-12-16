import React, { useState, useEffect } from 'react';
import { 
  LegacyV2Modal, 
  LegacyV2Form, 
  LegacyV2FormSection, 
  LegacyV2FormGroup, 
  LegacyV2Label, 
  LegacyV2Input, 
  LegacyV2Select,
  LegacyV2Button,
  LegacyV2ModalFooter
} from './LegacyV2Modal';
import type { Barbero, Service } from "@/types/db";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

interface LegacyEditarBarberoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barbero: Barbero;
  onSave: (data: Partial<Barbero>) => Promise<void>;
}

export function LegacyEditarBarberoModal({ 
  open, 
  onOpenChange, 
  barbero,
  onSave 
}: LegacyEditarBarberoModalProps) {
  const [formData, setFormData] = useState({
    username: barbero.username || "",
    email: barbero.email || "",
    telefono: barbero.telefono || "",
    especialidades: barbero.especialidades || [] as string[]
  });
  
  const [serviciosDisponibles, setServiciosDisponibles] = useState<Service[]>([]);

  useEffect(() => {
    if (open && barbero.id_sucursal) {
      loadServiciosDisponibles();
    }
  }, [open, barbero.id_sucursal]);

  useEffect(() => {
    setFormData({
      username: barbero.username || "",
      email: barbero.email || "",
      telefono: barbero.telefono || "",
      especialidades: barbero.especialidades || []
    });
  }, [barbero]);

  const loadServiciosDisponibles = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("mibarber_servicios")
        .select("*")
        .eq("id_sucursal", barbero.id_sucursal || '')
        .eq("activo", true)
        .order("nombre");

      if (error) throw error;
      setServiciosDisponibles(data || []);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      setServiciosDisponibles([]);
    }
  };

  const handleEspecialidadChange = (servicioId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        especialidades: [...prev.especialidades, servicioId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        especialidades: prev.especialidades.filter(id => id !== servicioId)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert("Error al guardar los cambios");
    }
  };

  const handleClose = () => {
    // Resetear los valores a los originales
    setFormData({
      username: barbero.username || "",
      email: barbero.email || "",
      telefono: barbero.telefono || "",
      especialidades: barbero.especialidades || []
    });
    onOpenChange(false);
  };

  return (
    <LegacyV2Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Información Personal"
    >
      <LegacyV2Form onSubmit={handleSubmit}>
        <LegacyV2FormSection>
          <div className="v2-form-grid">
            <LegacyV2FormGroup>
              <LegacyV2Label>Nombre</LegacyV2Label>
              <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                {barbero.nombre}
              </div>
              <p className="text-xs text-qoder-dark-text-muted mt-1">
                El nombre no puede ser modificado. Contacta a un administrador si necesitas cambiarlo.
              </p>
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label>Nombre de Usuario</LegacyV2Label>
              <LegacyV2Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Nombre de usuario"
              />
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label>Email</LegacyV2Label>
              <LegacyV2Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
              />
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label>Teléfono</LegacyV2Label>
              <LegacyV2Input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="099 123 456"
              />
            </LegacyV2FormGroup>

            <div className="md:col-span-2">
              <LegacyV2Label>Servicios que Ofrezco</LegacyV2Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {serviciosDisponibles.length > 0 ? (
                  serviciosDisponibles.map((servicio) => {
                    const isChecked = formData.especialidades.includes(servicio.id_servicio);
                    return (
                      <div key={servicio.id_servicio} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`servicio-${servicio.id_servicio}`}
                          checked={isChecked}
                          onChange={(e) => handleEspecialidadChange(servicio.id_servicio, e.target.checked)}
                          className="qoder-dark-checkbox h-5 w-5 rounded border-qoder-dark-border bg-qoder-dark-bg-form text-qoder-dark-accent-primary focus:ring-qoder-dark-accent-primary"
                        />
                        <label 
                          htmlFor={`servicio-${servicio.id_servicio}`} 
                          className="ml-2 text-qoder-dark-text-primary"
                        >
                          {servicio.nombre}
                        </label>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-qoder-dark-text-muted text-sm col-span-3">
                    No hay servicios disponibles en tu sucursal
                  </p>
                )}
              </div>
            </div>
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
            Guardar Cambios
          </LegacyV2Button>
        </LegacyV2ModalFooter>
      </LegacyV2Form>
    </LegacyV2Modal>
  );
}