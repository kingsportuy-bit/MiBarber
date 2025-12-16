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
    <div className="v2-overlay">
      <div className="v2-modal" style={{ maxWidth: '600px' }}>
        <div className="v2-modal-header">
          <h2 className="v2-modal-title">
            Configuración Inicial de tu Barbería
          </h2>
        </div>
        
        <div className="v2-modal-body">
          <p className="text-[var(--text-secondary)] mb-6">
            Bienvenido a Barberox! Completa la información de tu primera sucursal para comenzar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="v2-label">
                  Nombre de la Barbería
                </label>
                <input
                  type="text"
                  name="nombre_barberia"
                  value={formData.nombre_barberia}
                  onChange={handleChange}
                  className="v2-input"
                  placeholder="Ej: Barberox Principal"
                  required
                />
              </div>
              
              <div>
                <label className="v2-label">
                  Celular
                </label>
                <input
                  type="text"
                  name="cel"
                  value={formData.cel}
                  onChange={handleChange}
                  className="v2-input"
                  placeholder="Ej: +1234567890"
                  required
                />
              </div>
              
              <div>
                <label className="v2-label">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  className="v2-input"
                  placeholder="Ej: +0987654321"
                />
              </div>
              
              <div>
                <label className="v2-label">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="v2-input"
                  placeholder="Dirección completa"
                  required
                />
              </div>
              
              <div>
                <label className="v2-label">
                  Horario 1
                </label>
                <input
                  type="text"
                  name="horario1"
                  value={formData.horario1}
                  onChange={handleChange}
                  className="v2-input"
                  placeholder="Ej: Lun-Vie: 9:00-18:00"
                  required
                />
              </div>
              
              <div>
                <label className="v2-label">
                  Horario 2
                </label>
                <input
                  type="text"
                  name="horario2"
                  value={formData.horario2}
                  onChange={handleChange}
                  className="v2-input"
                  placeholder="Ej: Sáb: 9:00-14:00"
                />
              </div>
            </div>
          </form>
        </div>
        
        <div className="v2-modal-footer">
          <button
            type="button"
            onClick={() => setMostrarRegistro(true)}
            className="v2-btn v2-btn-secondary"
          >
            Registrar Nueva Barbería
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit as any}
            className="v2-btn v2-btn-primary"
            disabled={updateBarberiaInfoMutation.isPending}
          >
            {updateBarberiaInfoMutation.isPending ? "Guardando..." : "Comenzar"}
          </button>
        </div>
      </div>
    </div>
  );
}