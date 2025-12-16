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
    <div className="v2-overlay">
      <div className="v2-modal" style={{ maxWidth: '400px' }}>
        <div className="v2-modal-header">
          <h2 className="v2-modal-title">
            Iniciar Sesión
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
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
                placeholder="Ingresa tu nombre de usuario"
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
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm py-2">
                {error}
              </div>
            )}
          </div>
        </form>
        
        <div className="v2-modal-footer">
          <button
            type="submit"
            onClick={handleSubmit as any}
            className="v2-btn v2-btn-primary w-full"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
