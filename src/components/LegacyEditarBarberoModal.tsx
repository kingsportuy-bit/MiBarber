import React, { useState, useEffect } from "react";
import type { Barbero, Service } from "@/types/db";
import { getSupabaseClient } from "@/lib/supabaseClient";

// Import Qoder UI components
import { QoderInput } from "@/components/ui/QoderInput";
import { QoderButton } from "@/components/ui/QoderButton";
import { QoderSwitch } from "@/components/ui/QoderSwitch";

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
  onSave,
}: LegacyEditarBarberoModalProps) {
  const [formData, setFormData] = useState({
    username: barbero.username || "",
    email: barbero.email || "",
    telefono: barbero.telefono || "",
    especialidades: barbero.especialidades || ([] as string[]),
  });

  const [serviciosDisponibles, setServiciosDisponibles] = useState<Service[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && barbero.id_sucursal) {
      loadServiciosDisponibles();
    }
  }, [open, barbero.id_sucursal]);

  useEffect(() => {
    if (open) {
      setFormData({
        username: barbero.username || "",
        email: barbero.email || "",
        telefono: barbero.telefono || "",
        especialidades: barbero.especialidades || [],
      });
    }
  }, [open, barbero]);

  const loadServiciosDisponibles = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("mibarber_servicios")
        .select("*")
        .eq("id_sucursal", barbero.id_sucursal || "")
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
      setFormData((prev) => ({
        ...prev,
        especialidades: [...prev.especialidades, servicioId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        especialidades: prev.especialidades.filter((id) => id !== servicioId),
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="v2-overlay" onClick={handleClose}>
      <div className="v2-modal max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header border-b border-[#1a1a1a] pb-4 mb-4">
          <h2 className="text-xl font-bold font-[family-name:var(--font-rasputin)] text-[#F5F0EB] tracking-wide">
            Editar Perfil
          </h2>
          <button onClick={handleClose} className="text-[#8a8a8a] hover:text-[#C5A059] transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="v2-modal-body space-y-4">
          <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[13px] text-[#8a8a8a] font-[family-name:var(--font-body)]">Nombre Completo</span>
            <span className="text-white font-medium font-[family-name:var(--font-body)]">{barbero.nombre}</span>
            <p className="text-xs text-[#555] mt-1 italic">Contacta al administrador para modificar este campo legal.</p>
          </div>

          <QoderInput
            label="Usuario (Alias)"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="@tu_usuario"
          />

          <QoderInput
            label="Email de Contacto"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="email@ejemplo.com"
          />

          <QoderInput
            label="Teléfono"
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
            placeholder="099 123 456"
          />

          <div className="pt-4 border-t border-[#1a1a1a]">
            <h3 className="text-lg font-bold font-[family-name:var(--font-rasputin)] text-[#F5F0EB] mb-1">
              Servicios que Ofrezco
            </h3>
            <p className="text-[13.5px] text-[#8a8a8a] mb-5 font-[family-name:var(--font-body)]">
              Activa los servicios que este barbero está capacitado para realizar.
            </p>

            <div className="flex flex-col gap-4">
              {serviciosDisponibles.length > 0 ? (
                serviciosDisponibles.map((servicio) => {
                  const isChecked = formData.especialidades.includes(servicio.id_servicio);
                  return (
                    <QoderSwitch
                      key={servicio.id_servicio}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleEspecialidadChange(servicio.id_servicio, checked)}
                      label={servicio.nombre}
                      description={`Servicio disponible en la sucursal`}
                    />
                  );
                })
              ) : (
                <p className="text-[#555] text-[13.5px] italic">
                  No hay servicios cargados en esta sucursal.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="v2-modal-footer flex gap-3 justify-end items-center mt-6 pt-4 border-t border-[#1a1a1a]">
          <button type="button" onClick={handleClose} disabled={isSaving} className="px-4 py-2 text-[14px] font-medium text-[#8a8a8a] hover:text-[#C5A059] transition-colors">
            Cancelar
          </button>
          <QoderButton variant="primary" onClick={handleSubmit} isLoading={isSaving}>
            Guardar Cambios
          </QoderButton>
        </div>
      </div>
    </div>
  );
}