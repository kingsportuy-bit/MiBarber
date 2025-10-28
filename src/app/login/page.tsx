"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Barbero } from "@/types/db";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  // Verificar si ya está autenticado al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si hay una sesión activa en localStorage
        const sessionStr = localStorage.getItem('barber_auth_session');
        if (sessionStr) {
          try {
            const sessionData = JSON.parse(sessionStr);
            // Verificar si la sesión aún es válida
            if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
              // Si ya está autenticado, redirigir a la página protegida
              console.log('✅ Login: Usuario ya autenticado, redirigiendo a /inicio');
              router.replace("/inicio");
              return;
            } else {
              // Sesión expirada, limpiar
              localStorage.removeItem('barber_auth_session');
            }
          } catch (error) {
            // Datos inválidos, limpiar
            localStorage.removeItem('barber_auth_session');
          }
        }
        
        // Si no está autenticado, mostrar el formulario de login
        console.log('❌ Login: Usuario no autenticado, mostrando formulario');
        setCheckingAuth(false);
      } catch (error) {
        console.error('💥 Login: Error verificando autenticación:', error);
        setCheckingAuth(false);
      }
    };

    // Ejecutar inmediatamente la verificación
    checkAuth();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Buscar al usuario en la tabla mibarber_barberos por username
      const { data, error: userError } = await supabase
        .from('mibarber_barberos')
        .select('*')
        .eq('username', username)
        .single();
      
      if (userError || !data) {
        setError("Usuario no encontrado");
        setLoading(false);
        return;
      }
      
      const user = data as Barbero;
      
      // Verificar la contraseña (en producción esto debería ser hasheado)
      if (user.password_hash !== password) {
        setError("Contraseña incorrecta");
        setLoading(false);
        return;
      }
      
      // Crear una sesión de autenticación simulada
      const sessionData = {
        user: {
          id: user.id_barbero,
          email: user.email,
          name: user.nombre,
          username: user.username,
          nivel_permisos: user.nivel_permisos, // Incluir nivel_permisos en la sesión
          admin: user.admin, // Incluir admin en la sesión
          id_barberia: user.id_barberia, // Incluir id_barberia en la sesión
          id_sucursal: user.id_sucursal // Incluir id_sucursal en la sesión
        },
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // Expira en 24 horas
      };
      
      // Guardar en localStorage para simular sesión persistente
      if (typeof window !== 'undefined') {
        localStorage.setItem('barber_auth_session', JSON.stringify(sessionData));
        // También establecer una cookie para que el middleware pueda detectar la sesión
        document.cookie = `barber_auth_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        
        // Disparar evento personalizado para notificar el cambio de autenticación
        window.dispatchEvent(new CustomEvent('barberAuthChange', { 
          detail: { user: data, action: 'login' 
        } }));
      }
      
      // Esperar un momento para que los listeners actualicen su estado
      // antes de redirigir
      setTimeout(() => {
        // Redirigir a la página protegida
        router.replace("/inicio");
      }, 100); // Pequeño retraso para asegurar la actualización del estado
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
      setLoading(false);
    }
  }

  // Si está verificando la autenticación, mostrar pantalla de carga
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary mx-auto mb-4"></div>
          <p className="text-qoder-dark-text-secondary">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-transparent p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-qoder-dark-text-primary mb-2">
            <span className="barberox-barbero">Barbero</span>
            <span className="barberox-x">x</span>
          </h1>
          <p className="text-qoder-dark-text-secondary">
            Sistema de gestión para barberías
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 bg-transparent p-6 rounded-none border-0">
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}