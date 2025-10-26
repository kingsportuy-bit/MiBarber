"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MobileMenu } from "@/components/MobileMenu";

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

  // Verificar autenticación desde localStorage
  useEffect(() => {
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
      pathname === "/caja"
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
        { href: "/estadisticas", label: "Estadísticas" },
        { href: "/caja", label: "Caja" },
      ];
    } else {
      tabs = [
        { href: "/agenda", label: "Agenda" },
        { href: "/whatsapp", label: "WhatsApp" },
        { href: "/mis-estadisticas", label: "Mis Estadísticas" },
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
    <nav className="sticky top-0 z-40 w-full border-b border-qoder-dark-border-primary bg-qoder-dark-bg-quaternary">
      <div className="mx-auto max-w-6xl px-4 h-12 flex items-center min-w-0">
        <Link
          href="/mibarber"
          className="font-semibold text-qoder-dark-text-primary hover:text-qoder-dark-accent-primary px-3 py-1 rounded-md hover:bg-qoder-dark-bg-hover mr-4"
        >
          MiBarber
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
                  className={`px-3 py-1 rounded-md ${
                    active
                      ? "bg-qoder-dark-bg-hover text-qoder-dark-text-primary"
                      : "text-qoder-dark-text-secondary hover:bg-qoder-dark-bg-hover hover:text-qoder-dark-text-primary"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {authState.isAuthenticated && (
            <Link
              href={authState.isAdmin ? "/mi-barberia" : "/mis-datos"}
              className={`hidden md:block px-3 py-1 rounded-md text-sm ${
                (authState.isAdmin && pathname === "/mi-barberia") || 
                (!authState.isAdmin && pathname === "/mis-datos")
                  ? "bg-qoder-dark-bg-hover text-qoder-dark-text-primary"
                  : "text-qoder-dark-text-secondary hover:bg-qoder-dark-bg-hover hover:text-qoder-dark-text-primary"
              }`}
            >
              {authState.isAdmin ? "Mi Barbería" : "Mis Datos"}
            </Link>
          )}
          
          {authState.isAuthenticated && authState.userName && (
            <div className="hidden md:block text-qoder-dark-text-primary text-sm font-medium bg-qoder-dark-bg-secondary px-3 py-1 rounded-full border border-qoder-dark-border-primary">
              {authState.userName}
            </div>
          )}
          
          {authState.isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="hidden md:flex text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary p-1 rounded-md hover:bg-qoder-dark-bg-hover items-center gap-1"
              title="Cerrar sesión"
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h12a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm">Salir</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden md:block text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary px-3 py-1 rounded-md hover:bg-qoder-dark-bg-hover text-sm"
            >
              Iniciar Sesión
            </Link>
          )}
          
          {/* Menú móvil */}
          <MobileMenu />
          
          {/* Botón de logout para móviles */}
          {authState.isAuthenticated && (
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded-md text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary hover:bg-qoder-dark-bg-hover"
              title="Cerrar sesión"
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