"use client";

import { useState, useEffect, useCallback } from "react";
import type { Barbero, Service } from "@/types/db";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

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
  console.log("EditarBarberoModal - Props recibidas:", { open, barbero });
  
  // Log para diagnóstico de especialidades
  console.log('[DIAGNÓSTICO] EditarBarberoModal - Datos del barbero:', barbero);
  console.log('[DIAGNÓSTICO] EditarBarberoModal - Especialidades del barbero:', barbero?.especialidades);
  console.log('[DIAGNÓSTICO] EditarBarberoModal - Tipo de especialidades:', typeof barbero?.especialidades);
  console.log('[DIAGNÓSTICO] EditarBarberoModal - ¿Es un array?', Array.isArray(barbero?.especialidades));
  
  const [username, setUsername] = useState(barbero.username || "");
  const [email, setEmail] = useState(barbero.email || "");
  const [telefono, setTelefono] = useState(barbero.telefono || "");
  const [especialidades, setEspecialidades] = useState<string[]>(() => {
    // Asegurarse de que las especialidades se inicialicen correctamente
    const initialEspecialidades = barbero.especialidades || [];
    console.log("Inicializando especialidades:", initialEspecialidades);
    return initialEspecialidades;
  });
  const [serviciosDisponibles, setServiciosDisponibles] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cliente de consulta para invalidar cachés
  const queryClient = useQueryClient();

  const loadServiciosDisponibles = useCallback(async () => {
    console.log("Cargando servicios disponibles para sucursal:", barbero.id_sucursal);
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
      
      // Verificar las especialidades cargadas
      console.log("Servicios disponibles cargados:", data);
      console.log("Especialidades actuales:", especialidades);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      setServiciosDisponibles([]);
    }
  }, [barbero.id_sucursal, especialidades]);
  
  // Cargar servicios disponibles cuando se abre el modal
  useEffect(() => {
    console.log("useEffect - Cambio en open o id_sucursal:", { open, id_sucursal: barbero.id_sucursal });
    if (open && barbero.id_sucursal) {
      loadServiciosDisponibles();
    }
  }, [open, barbero.id_sucursal, loadServiciosDisponibles]);
  
  // Actualizar especialidades cuando cambie el barbero
  useEffect(() => {
    console.log("useEffect - Cambio en barbero:", barbero);
    const newEspecialidades = barbero.especialidades || [];
    console.log("Actualizando especialidades desde barbero:", newEspecialidades);
    setEspecialidades(newEspecialidades);
  }, [barbero]);
  
  // Log cuando cambian las especialidades
  useEffect(() => {
    console.log("Especialidades actualizadas:", especialidades);
  }, [especialidades]);

  const handleEspecialidadChange = (servicioId: string, checked: boolean) => {
    console.log(`Cambiando especialidad ${servicioId} a ${checked}`);
    console.log("Especialidades actuales antes del cambio:", especialidades);
    
    if (checked) {
      setEspecialidades(prev => {
        const newEspecialidades = [...prev, servicioId];
        console.log("Agregando especialidad, nuevo array:", newEspecialidades);
        return newEspecialidades;
      });
    } else {
      setEspecialidades(prev => {
        const newEspecialidades = prev.filter(id => id !== servicioId);
        console.log("Removiendo especialidad, nuevo array:", newEspecialidades);
        return newEspecialidades;
      });
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
      
      // Invalidar las consultas relacionadas con barberos y servicios para que se actualicen
      queryClient.invalidateQueries({ queryKey: ["barberos"] });
      queryClient.invalidateQueries({ queryKey: ["barberos-list"] });
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
      
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
      <div className="v2-overlay" onClick={handleClose}></div>
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className="v2-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="v2-modal-header">
            <h2 className="v2-modal-title">
              Editar Información Personal
            </h2>
            <button 
              onClick={handleClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl"
            >
              ×
            </button>
          </div>
          <div className="v2-modal-body">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="v2-label">
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
                  <label className="v2-label">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="v2-input"
                    placeholder="Nombre de usuario"
                  />
                </div>

                <div>
                  <label className="v2-label">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="v2-input"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="v2-label">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="v2-input"
                    placeholder="099 123 456"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="v2-label">
                    Servicios que Ofrezco
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {serviciosDisponibles.length > 0 ? (
                      serviciosDisponibles.map((servicio) => {
                        const isChecked = especialidades.includes(servicio.id_servicio);
                        console.log(`Renderizando servicio ${servicio.id_servicio} - ${servicio.nombre}, checked: ${isChecked}`);
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

              <div className="v2-modal-footer">
                <button
                  type="button"
                  onClick={handleClose}
                  className="v2-btn v2-btn-secondary"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="v2-btn v2-btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
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