"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { MobileMenu } from "@/components/MobileMenu";
import { UserDropdownMenu } from "@/components/UserDropdownMenu";

interface Tab {
  href: string;
  label: string;
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [shouldHideCompletely, setShouldHideCompletely] = useState(false);
  const scrollPositionRef = useRef(0);

  // Efecto para ocultar completamente el NavBar cuando se está en la vista de chat individual
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && pathname?.startsWith("/whatsapp")) {
        // Solo ocultar completamente en dispositivos móviles
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          // Ocultar el NavBar tanto en la lista de chats como en la vista individual (solo en móvil)
          setShouldHideCompletely(window.location.hash === '#chat-view' || window.location.hash === '#chat-list');
        } else {
          // En desktop, no ocultar completamente
          setShouldHideCompletely(false);
        }
      }
    };

    // Verificar el hash inicial
    handleHashChange();

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  // Efecto para detectar el scroll y ocultar/mostrar la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      
      // Solo aplicar el comportamiento de ocultar en dispositivos móviles
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        // En desktop, siempre mostrar la barra
        setIsNavbarHidden(false);
        return;
      }
      
      // Si estamos ocultando completamente el NavBar, no hacer nada
      if (shouldHideCompletely) return;
      
      const currentScrollPosition = window.scrollY;
      
      // Si el usuario está cerca de la parte superior, siempre mostrar la barra
      if (currentScrollPosition < 60) {
        setIsNavbarHidden(false);
        scrollPositionRef.current = currentScrollPosition;
        return;
      }
      
      // Comparar la posición actual con la anterior para determinar la dirección del scroll
      if (currentScrollPosition > scrollPositionRef.current) {
        // Scroll hacia abajo - ocultar la barra
        setIsNavbarHidden(true);
      } else {
        // Scroll hacia arriba - mostrar la barra
        setIsNavbarHidden(false);
      }
      
      // Actualizar la posición de referencia
      scrollPositionRef.current = currentScrollPosition;
    };

    // Agregar el event listener para el scroll
    window.addEventListener('scroll', handleScroll);
    
    // Limpiar el event listener al desmontar el componente
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [shouldHideCompletely]);

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
      (pathname === "/v2/caja")
    ) {
      router.push("/agenda");
    }
  }, [pathname, authState.isAuthenticated, authState.isAdmin, router]);

  // Mostrar la barra de navegación incluso si hay problemas con la autenticación
  const shouldHideNavBar = pathname?.startsWith("/login");
  
  // Ocultar el NavBar cuando se está en la vista de chat individual de WhatsApp
  const shouldHideNavBarCompletely = shouldHideCompletely;

  if (shouldHideNavBar || shouldHideNavBarCompletely) {
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
        { href: "/caja", label: "Caja" },
        { href: "/estadisticas", label: "Estadísticas" },
        { href: "/mi-barberia", label: "Mi Barbería" },
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
      <nav className={`navbar ${isNavbarHidden ? 'navbar-hidden' : ''}`}>
        <div className="nav-container min-w-0">
          <div className="animate-pulse">Cargando...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`navbar ${isNavbarHidden ? 'navbar-hidden' : ''}`}>
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
        <div className="hidden md:flex items-center gap-1 text-xs">
          {authState.isAuthenticated &&
            tabs.map((t) => {
              const active = pathname?.startsWith(t.href);
              // Verificar si la página es exclusiva de administradores
              const isAdminPage = t.href === '/estadisticas' || t.href === '/admin' || t.href === '/admin/bloqueos' || t.href === '/v2/caja' || t.href === '/mi-barberia';
              
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`nav-link ${active ? 'active' : ''} px-2 py-1 flex items-center gap-1`}
                >
                  <span>{t.label}</span>
                  {isAdminPage && authState.isAdmin && (
                    <span className="text-[10px] bg-orange-500 text-white px-1 py-0.5 rounded">
                      Admin
                    </span>
                  )}
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
          
          {/* Menú móvil - ocultar en pantallas pequeñas donde aparece BottomNav */}
          <div className="md:hidden">
            <MobileMenu 
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
          
          {/* Eliminar el botón de logout para móviles ya que ahora está en el menú desplegable */}
        </div>
      </div>
    </nav>
  );
}