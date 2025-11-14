"use client";

import { useState } from "react";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { RegistroAdministrador } from "@/components/RegistroAdministrador";

interface ConfiguracionInicialProps {
  onComplete: () => void;
}

export function ConfiguracionInicial({ onComplete }: ConfiguracionInicialProps) {
  const { updateBarberiaInfoMutation } = useBarberiaInfo();
  const [formData, setFormData] = useState({
    nombre_barberia: "",
    cel: "",
    tel: "",
    direccion: "",
    horario1: "",
    horario2: ""
  });
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear la primera sucursal
    updateBarberiaInfoMutation.mutate({
      numero_sucursal: 1,
      ...formData
    }, {
      onSuccess: () => {
        onComplete();
      },
      onError: (error) => {
        console.error("Error al guardar la configuración:", error);
        alert("Error al guardar la configuración. Por favor, inténtalo de nuevo.");
      }
    });
  };

  const handleRegistroCompleto = () => {
    setMostrarRegistro(false);
    onComplete();
  };

  // Si se necesita mostrar el registro de administrador
  if (mostrarRegistro) {
    return <RegistroAdministrador onRegistroCompleto={handleRegistroCompleto} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 qoder-dark-modal-overlay">
      <div className="qoder-dark-card w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-qoder-dark-text-primary mb-2">
            Configuración Inicial de tu Barbería
          </h2>
          <p className="text-qoder-dark-text-secondary">
            Bienvenido a Barberox! Completa la información de tu primera sucursal para comenzar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Nombre de la Barbería
              </label>
              <input
                type="text"
                name="nombre_barberia"
                value={formData.nombre_barberia}
                onChange={handleChange}
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Ej: Barberox Principal"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Celular
              </label>
              <input
                type="text"
                name="cel"
                value={formData.cel}
                onChange={handleChange}
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Ej: +1234567890"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Teléfono
              </label>
              <input
                type="text"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Ej: +0987654321"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Dirección completa"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Horario 1
              </label>
              <input
                type="text"
                name="horario1"
                value={formData.horario1}
                onChange={handleChange}
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Ej: Lun-Vie: 9:00-18:00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                Horario 2
              </label>
              <input
                type="text"
                name="horario2"
                value={formData.horario2}
                onChange={handleChange}
                className="qoder-dark-input w-full p-3 rounded-lg"
                placeholder="Ej: Sáb: 9:00-14:00"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setMostrarRegistro(true)}
              className="qoder-dark-button px-6 py-3 rounded-lg font-medium hover-lift smooth-transition"
            >
              Registrar Nueva Barbería
            </button>
            
            <button
              type="submit"
              className="action-button"
              disabled={updateBarberiaInfoMutation.isPending}
            >
              {updateBarberiaInfoMutation.isPending ? "Guardando..." : "Comenzar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}