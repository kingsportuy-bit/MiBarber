"use client";

import { useState, useEffect, useCallback } from "react";
import type { Barbero, Service } from "@/types/db";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface EditarBarberoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barbero: Barbero;
  onSave: (data: Partial<Barbero>) => Promise<void>;
}

export function EditarBarberoModal({ 
  open, 
  onOpenChange, 
  barbero,
  onSave 
}: EditarBarberoModalProps) {
  const [username, setUsername] = useState(barbero.username || "");
  const [email, setEmail] = useState(barbero.email || "");
  const [telefono, setTelefono] = useState(barbero.telefono || "");
  const [especialidades, setEspecialidades] = useState<string[]>(barbero.especialidades || []);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadServiciosDisponibles = useCallback(async () => {
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
  }, [barbero.id_sucursal]);

  // Cargar servicios disponibles cuando se abre el modal
  useEffect(() => {
    if (open && barbero.id_sucursal) {
      loadServiciosDisponibles();
    }
  }, [open, barbero.id_sucursal, loadServiciosDisponibles]);

  const handleEspecialidadChange = (servicioId: string, checked: boolean) => {
    if (checked) {
      setEspecialidades(prev => [...prev, servicioId]);
    } else {
      setEspecialidades(prev => prev.filter(id => id !== servicioId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave({
        username,
        email,
        telefono,
        especialidades
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Resetear los valores a los originales
    setUsername(barbero.username || "");
    setEmail(barbero.email || "");
    setTelefono(barbero.telefono || "");
    setEspecialidades(barbero.especialidades || []);
    onOpenChange(false);
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className="bg-qoder-dark-bg-primary rounded-xl border border-qoder-dark-border-primary w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-qoder-dark-text-primary">
                Editar Información Personal
              </h2>
              <button 
                onClick={handleClose}
                className="text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Nombre
                  </label>
                  <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                    {barbero.nombre}
                  </div>
                  <p className="text-xs text-qoder-dark-text-muted mt-1">
                    El nombre no puede ser modificado. Contacta a un administrador si necesitas cambiarlo.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full qoder-dark-input p-3 rounded-lg"
                    placeholder="Nombre de usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full qoder-dark-input p-3 rounded-lg"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full qoder-dark-input p-3 rounded-lg"
                    placeholder="099 123 456"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Servicios que Ofrezco
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {serviciosDisponibles.length > 0 ? (
                      serviciosDisponibles.map((servicio) => (
                        <div key={servicio.id_servicio} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`servicio-${servicio.id_servicio}`}
                            checked={especialidades.includes(servicio.id_servicio)}
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
                      ))
                    ) : (
                      <p className="text-qoder-dark-text-muted text-sm col-span-3">
                        No hay servicios disponibles en tu sucursal
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="qoder-dark-button px-4 py-2 rounded-lg"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}