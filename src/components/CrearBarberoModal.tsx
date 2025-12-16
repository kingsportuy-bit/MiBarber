"use client";

import { useState, useEffect } from "react";
import { useBarberos } from "@/hooks/useBarberos";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { toast } from "sonner";

interface CrearBarberoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idBarberia: string;
  id_sucursal?: string; // Agregar id_sucursal como prop opcional
  onBarberoCreado: () => void;
}

export function CrearBarberoModal({ open, onOpenChange, idBarberia, id_sucursal, onBarberoCreado }: CrearBarberoModalProps) {
  const { createBarbero } = useBarberos();
  const { serviciosQuery } = useBarberiaInfo();
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    username: "",
    password: "",
    nivel_permisos: 2, // Por defecto, nuevo barbero normal
    especialidades: [] as string[] // Cambiar a array de strings para seleccionar servicios
  });
  const [loading, setLoading] = useState(false);

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        username: "",
        password: "",
        nivel_permisos: 2,
        especialidades: []
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEspecialidadChange = (servicioId: string, servicioNombre: string) => {
    setFormData(prev => {
      const especialidades = [...prev.especialidades];
      const index = especialidades.findIndex(e => e === servicioId);
      
      if (index >= 0) {
        // Si ya está seleccionado, lo removemos
        especialidades.splice(index, 1);
      } else {
        // Si no está seleccionado, lo agregamos
        especialidades.push(servicioId);
      }
      
      return {
        ...prev,
        especialidades
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createBarbero.mutateAsync({
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
        username: formData.username,
        password_hash: formData.password, // En una implementación real, esto debería ser hasheado
        nivel_permisos: formData.nivel_permisos,
        especialidades: formData.especialidades,
        activo: true,
        id_barberia: idBarberia,
        id_sucursal: id_sucursal, // Incluir id_sucursal en los datos
        admin: formData.nivel_permisos === 1 // Sincronizar con nivel_permisos
      });
      
      toast.success("Barbero creado correctamente");
      onBarberoCreado();
      
      // Resetear el formulario antes de cerrar el modal
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        username: "",
        password: "",
        nivel_permisos: 2,
        especialidades: []
      });
      
      // Cerrar el modal después de resetear el formulario
      onOpenChange(false);
    } catch (error) {
      console.error("Error al crear barbero:", error);
      toast.error("Error al crear el barbero");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="v2-overlay">
      <div className="v2-modal" style={{ maxWidth: '500px' }}>
        <div className="v2-modal-header">
          <h3 className="v2-modal-title">
            Crear Nuevo Barbero
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
            <div>
              <label className="v2-label">
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="v2-input"
                placeholder="Nombre del barbero"
                required
              />
            </div>
            
            <div>
              <label className="v2-label">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="v2-input"
                placeholder="Teléfono de contacto"
              />
            </div>
            
            <div>
              <label className="v2-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="v2-input"
                placeholder="Email del barbero"
              />
            </div>
            
            <div>
              <label className="v2-label">
                Nombre de usuario
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="v2-input"
                placeholder="Nombre de usuario para login"
                required
              />
            </div>
            
            <div>
              <label className="v2-label">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="v2-input"
                placeholder="Contraseña para login"
                required
              />
            </div>
            
            <div>
              <label className="v2-label">
                Nivel de Permisos
              </label>
              <select
                name="nivel_permisos"
                value={formData.nivel_permisos}
                onChange={(e) => setFormData(prev => ({ ...prev, nivel_permisos: parseInt(e.target.value) }))}
                className="v2-select"
              >
                <option value={1}>Administrador - Acceso completo (1)</option>
                <option value={2}>Barbero Normal - Acceso limitado (2)</option>
              </select>
            </div>
            
            <div>
              <label className="v2-label">
                Especialidades (servicios que puede realizar este barbero)
              </label>
              <div className="border border-[var(--border-primary)] rounded-lg p-3 max-h-40 overflow-y-auto">
                {serviciosQuery.isLoading ? (
                  <p className="text-[var(--text-secondary)]">Cargando servicios...</p>
                ) : serviciosQuery.isError ? (
                  <p className="text-red-500">Error al cargar servicios</p>
                ) : serviciosQuery.data && serviciosQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {serviciosQuery.data.map((servicio) => (
                      <label key={servicio.id_servicio} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.especialidades.includes(servicio.id_servicio)}
                          onChange={() => handleEspecialidadChange(servicio.id_servicio, servicio.nombre)}
                          className="v2-checkbox"
                        />
                        <span className="text-[var(--text-primary)]">{servicio.nombre}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)]">No hay servicios disponibles</p>
                )}
              </div>
            </div>
          </div>
        </form>
        
        <div className="v2-modal-footer">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="v2-btn v2-btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit as any}
            className="v2-btn v2-btn-primary"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear Barbero"}
          </button>
        </div>
      </div>
    </div>
  );
}