"use client";

import { useState } from "react";
import { useCrearBarberia } from "@/hooks/useCrearBarberia";
import { toast } from "sonner";

interface RegistroAdministradorProps {
  onRegistroCompleto: () => void;
}

export function RegistroAdministrador({ onRegistroCompleto }: RegistroAdministradorProps) {
  const { crearBarberia } = useCrearBarberia();
  const [formData, setFormData] = useState({
    nombreAdministrador: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    
    // Validar que todos los campos requeridos estén llenos
    if (!formData.nombreAdministrador || !formData.username || !formData.password || !formData.email) {
      toast.error("Por favor complete todos los campos");
      return;
    }
    
    try {
      await crearBarberia.mutateAsync({
        nombreAdministrador: formData.nombreAdministrador,
        username: formData.username,
        password: formData.password,
        email: formData.email
      });
      
      toast.success("Barbería y administrador creados correctamente");
      onRegistroCompleto();
    } catch (error: any) {
      console.error("Error al crear barbería:", error);
      toast.error(error.message || "Error al crear la barbería");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="qoder-dark-card w-[90vw] max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-qoder-dark-text-primary mb-2">
            Registrar Nueva Barbería
          </h2>
          <p className="text-qoder-dark-text-secondary">
            Crea tu propia barbería y configura tu cuenta de administrador
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
              Nombre del administrador
            </label>
            <input
              type="text"
              name="nombreAdministrador"
              value={formData.nombreAdministrador}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Tu nombre completo"
              required
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
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Nombre de usuario para login"
              required
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
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Tu email"
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
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Contraseña"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Confirma tu contraseña"
              required
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="action-button w-full"
              disabled={crearBarberia.isPending}
            >
              {crearBarberia.isPending ? "Creando..." : "Crear Barbería"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}