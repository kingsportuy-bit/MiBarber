"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MobileMenu } from "@/components/MobileMenu";
import { UserDropdownMenu } from "@/components/UserDropdownMenu";

interface Tab {
  href: string;
  label: string;
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Estado local para la autenticación
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    userName: "",
    isChecking: true,
  });

  // Estado del menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Verificar autenticación desde localStorage
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    const checkAuth = () => {
      try {
        const sessionStr = localStorage.getItem("barber_auth_session");

        if (sessionStr) {
          const sessionData = JSON.parse(sessionStr);

          // Verificar estructura de datos
          let userData;
          if (sessionData.user && typeof sessionData.user === "object") {
            userData = sessionData.user;
          } else if (typeof sessionData === "object" && sessionData.id) {
            userData = sessionData;
          } else {
            setAuthState({
              isAuthenticated: false,
              isAdmin: false,
              userName: "",
              isChecking: false,
            });
            return;
          }

          // Verificar expiración
          if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
            localStorage.removeItem("barber_auth_session");
            setAuthState({
              isAuthenticated: false,
              isAdmin: false,
              userName: "",
              isChecking: false,
            });
            return;
          }

          // Verificar que userData tenga las propiedades necesarias
          if (!userData.id) {
            setAuthState({
              isAuthenticated: false,
              isAdmin: false,
              userName: "",
              isChecking: false,
            });
            return;
          }

          // Determinar si es administrador basado en el campo admin
          const isAdmin = userData.admin === true;
          const userName = userData.name || userData.nombre || "Administrador";

          setAuthState({
            isAuthenticated: true,
            isAdmin,
            userName,
            isChecking: false,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            userName: "",
            isChecking: false,
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          userName: "",
          isChecking: false,
        });
      }
    };

    checkAuth();

    // Escuchar cambios en el almacenamiento
    const handleStorageChange = () => {
      checkAuth();
    };

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("barberAuthChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("barberAuthChange", handleAuthChange);
    };
  }, []);

  // Redirigir a barberos normales que intenten acceder a Caja
  useEffect(() => {
    if (
      authState.isAuthenticated &&
      !authState.isAdmin &&
      (pathname === "/caja")
    ) {
      router.push("/agenda");
    }
  }, [pathname, authState.isAuthenticated, authState.isAdmin, router]);

  // Mostrar la barra de navegación incluso si hay problemas con la autenticación
  const shouldHideNavBar = pathname?.startsWith("/login");

  if (shouldHideNavBar) {
    return null;
  }

  // Determinar qué tabs mostrar según el rol del usuario
  let tabs: Tab[] = [];
  if (authState.isAuthenticated) {
    if (authState.isAdmin) {
      tabs = [
        { href: "/agenda", label: "Agenda" },
        { href: "/clientes", label: "Clientes" },
        { href: "/whatsapp", label: "WhatsApp" },
      ];
    } else {
      tabs = [
        { href: "/agenda", label: "Agenda" },
        { href: "/whatsapp", label: "WhatsApp" },
      ];
    }
  }

  const handleLogout = () => {
    // Eliminar sesión de localStorage
    localStorage.removeItem("barber_auth_session");
    // También eliminar la cookie
    document.cookie =
      "barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Actualizar estado local
    setAuthState({
      isAuthenticated: false,
      isAdmin: false,
      userName: "",
      isChecking: false,
    });

    setIsMobileMenuOpen(false);

    // Disparar evento personalizado para notificar el cambio
    window.dispatchEvent(
      new CustomEvent("barberAuthChange", {
        detail: { user: null, action: "logout" },
      }),
    );

    // Redirigir a la página de login
    router.push("/login");
  };

  // Mostrar estado de carga
  if (authState.isChecking) {
    return (
      <nav className="sticky top-0 z-40 w-full border-b border-qoder-dark-border-primary bg-qoder-dark-bg-quaternary">
        <div className="mx-auto max-w-6xl px-4 h-12 flex items-center">
          <div className="animate-pulse">Cargando...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-container min-w-0">
        <Link
          href="/inicio"
          className={`nav-logo font-bold ${pathname?.startsWith("/inicio") ? 'active' : ''}`}
          style={{ 
            paddingLeft: '20px', 
            paddingRight: '20px' 
          }}
        >
          <span className="barberox-barbero">Barbero</span>
          <span className="barberox-x">x</span>
        </Link>
        
        {/* Navegación de escritorio - ocultar en móviles */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          {authState.isAuthenticated &&
            tabs.map((t) => {
              const active = pathname?.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`nav-link ${active ? 'active' : ''}`}
                >
                  {t.label}
                </Link>
              );
            })}
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {/* Estadísticas y Mi Barbería se mueven al menú desplegable */}
          
          {authState.isAuthenticated && authState.userName && (
            <UserDropdownMenu 
              userName={authState.userName}
              isAdmin={authState.isAdmin}
              onLogout={handleLogout}
            />
          )}
          
          {authState.isAuthenticated ? (
            // El botón de salir se ha movido al menú desplegable del usuario
            null
          ) : (
            <Link
              href="/login"
              className="hidden md:block nav-link"
            >
              Iniciar Sesión
            </Link>
          )}
          
          {/* Menú móvil */}
          <MobileMenu 
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Botón de logout para móviles */}
          {authState.isAuthenticated && (
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded-md text-qoder-dark-text-primary hover:text-qoder-dark-accent-orange hover:bg-qoder-dark-bg-hover"
              title="Cerrar sesión"
              style={{ fontFamily: "'Roboto', 'Arial', sans-serif", color: '#ffffff' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}