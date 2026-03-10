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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionStr = localStorage.getItem('barber_auth_session');
        if (sessionStr) {
          try {
            const sessionData = JSON.parse(sessionStr);
            if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
              router.replace("/inicio");
              return;
            } else {
              localStorage.removeItem('barber_auth_session');
            }
          } catch (error) {
            localStorage.removeItem('barber_auth_session');
          }
        }
        setCheckingAuth(false);
      } catch (error) {
        console.error('Error verificando autenticaciÃ³n:', error);
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const normalizedUsername = username.toLowerCase();
      const { data, error: userError } = await supabase
        .from('mibarber_barberos')
        .select('*')
        .eq('username', normalizedUsername)
        .single();

      if (userError || !data) {
        setError("Usuario no encontrado");
        setLoading(false);
        return;
      }

      const user = data as Barbero;

      if (user.password_hash !== password) {
        setError("ContraseÃ±a incorrecta");
        setLoading(false);
        return;
      }

      const sessionData = {
        user: {
          id: user.id_barbero,
          email: user.email,
          name: user.nombre,
          username: user.username ? user.username.toLowerCase() : '',
          nivel_permisos: user.nivel_permisos,
          admin: user.admin,
          id_barberia: user.id_barberia,
          id_sucursal: user.id_sucursal
        },
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('barber_auth_session', JSON.stringify(sessionData));
        document.cookie = `barber_auth_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        window.dispatchEvent(new CustomEvent('barberAuthChange', {
          detail: { user: data, action: 'login' }
        }));
      }

      setTimeout(() => {
        if (user.conf_inicial === "0" || user.conf_inicial === null) {
          router.replace("/configuracion-inicial");
        } else {
          router.replace("/inicio");
        }
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'transparent',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#C5A059',
            borderBottomColor: '#C5A059',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'transparent',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <img
            src="/logo-barberox.png"
            alt="Barberox"
            style={{
              height: '56px',
              width: 'auto',
              objectFit: 'contain',
              margin: '0 auto 16px',
              display: 'block',
            }}
          />
          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-rasputin), serif',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Inteligencia artificial para barberías
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={onSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '8px',
              fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
            }}>
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu.usuario"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#C5A059'}
              onBlur={(e) => e.target.style.borderColor = '#222'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '8px',
              fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#C5A059'}
              onBlur={(e) => e.target.style.borderColor = '#222'}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '0.8125rem',
              fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="action-button"
            style={{
              width: '100%',
              padding: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: '8px',
            }}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.2)',
          fontSize: '0.75rem',
          marginTop: '48px',
          fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
        }}>
          Powered by{' '}
          <a
            href="https://codexa.uy"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link codexa-link"
          >
            Code<span className="codexa-x">x</span>a
          </a>
        </p>
      </div>
    </div>
  );
}
