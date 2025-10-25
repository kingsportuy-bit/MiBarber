"use client";

import { useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="qoder-dark-card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-qoder-dark-text-primary">
          Crear Nuevo Barbero
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="qoder-dark-input w-full p-2 rounded-lg"
              placeholder="Nombre del barbero"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="qoder-dark-input w-full p-2 rounded-lg"
              placeholder="Teléfono de contacto"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="qoder-dark-input w-full p-2 rounded-lg"
              placeholder="Email del barbero"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="qoder-dark-input w-full p-2 rounded-lg"
              placeholder="Nombre de usuario para login"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="qoder-dark-input w-full p-2 rounded-lg"
              placeholder="Contraseña para login"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
              Nivel de Permisos
            </label>
            <select
              name="nivel_permisos"
              value={formData.nivel_permisos}
              onChange={(e) => setFormData(prev => ({ ...prev, nivel_permisos: parseInt(e.target.value) }))}
              className="qoder-dark-input w-full p-2 rounded-lg"
            >
              <option value={1}>Administrador (1)</option>
              <option value={2}>Barbero Normal (2)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
              Especialidades (seleccione los servicios que puede realizar)
            </label>
            <div className="border border-qoder-dark-border-primary rounded-lg p-3 max-h-40 overflow-y-auto">
              {serviciosQuery.isLoading ? (
                <p className="text-qoder-dark-text-secondary">Cargando servicios...</p>
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
                        className="rounded"
                      />
                      <span className="text-qoder-dark-text-primary">{servicio.nombre}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-qoder-dark-text-secondary">No hay servicios disponibles</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="qoder-dark-button px-4 py-2 rounded-lg"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="qoder-dark-button-primary px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Barbero"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}