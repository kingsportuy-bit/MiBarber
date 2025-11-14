"use client";

import { useState } from "react";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

interface BarberoLoginProps {
  onLogin: () => void;
}

export function BarberoLogin({ onLogin }: BarberoLoginProps) {
  const { login } = useBarberoAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      // Llamar a login directamente como una función
      const response = await login({ 
        username: formData.username, 
        password: formData.password 
      });
      
      if (response.success) {
        onLogin();
      } else {
        setError(response.error || "Error al iniciar sesión");
      }
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 qoder-dark-modal-overlay">
      <div className="qoder-dark-card w-[90vw] max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-qoder-dark-text-primary mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-qoder-dark-text-secondary">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Ingresa tu nombre de usuario"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm py-2">
              {error}
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="action-button w-full"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}