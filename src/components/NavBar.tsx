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
  icon: React.ReactNode;
}

// Sidebar icons â€” SVG inline
const IconCalendarCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);

const IconCalendar = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const IconUsers = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconMessageCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const IconDollarSign = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconBarChart = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const IconSettings = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconLogOut = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const IconHome = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const IconShield = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Helper to format names: only first letter of the name and surname capitalized
function formatBarberName(name: string): string {
  if (!name) return name;
  const words = name.toLowerCase().split(' ').filter(word => word.length > 0);
  if (words.length === 0) return '';

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }

  // Format only first name and first surname
  const firstName = words[0];
  const lastName = words[1];

  return `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [shouldHideCompletely, setShouldHideCompletely] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const scrollPositionRef = useRef(0);

  // Ocultar completamente en la vista de chat individual de WhatsApp (mobile)
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && pathname?.startsWith("/whatsapp")) {
        // En WhatsApp móvil ya no ocultamos la NavBar (logo), queremos que se vea siempre
        setShouldHideCompletely(false);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [pathname]);

  // Ocultar en scroll (solo mobile)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      const isMobile = window.innerWidth < 768;
      if (!isMobile) { setIsNavbarHidden(false); return; }
      if (shouldHideCompletely) return;

      const currentScrollPosition = window.scrollY;
      if (currentScrollPosition < 60) {
        setIsNavbarHidden(false);
        scrollPositionRef.current = currentScrollPosition;
        return;
      }
      setIsNavbarHidden(currentScrollPosition > scrollPositionRef.current);
      scrollPositionRef.current = currentScrollPosition;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldHideCompletely]);

  // Auth state desde localStorage
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    userName: "",
    isChecking: true,
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkAuth = () => {
      try {
        let sessionStr = localStorage.getItem("barber_auth_session");
        if (!sessionStr) {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'barber_auth_session' && value) {
              sessionStr = decodeURIComponent(value);
              break;
            }
          }
        }

        if (sessionStr) {
          const sessionData = JSON.parse(sessionStr);
          let userData;
          if (sessionData.user && typeof sessionData.user === "object") {
            userData = sessionData.user;
          } else if (typeof sessionData === "object" && sessionData.id) {
            userData = sessionData;
          } else {
            setAuthState({ isAuthenticated: false, isAdmin: false, userName: "", isChecking: false });
            return;
          }
          if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
            localStorage.removeItem("barber_auth_session");
            setAuthState({ isAuthenticated: false, isAdmin: false, userName: "", isChecking: false });
            return;
          }
          if (!userData.id) {
            setAuthState({ isAuthenticated: false, isAdmin: false, userName: "", isChecking: false });
            return;
          }
          const isAdmin = userData.admin === true;
          const userName = userData.name || userData.nombre || "Administrador";
          setAuthState({ isAuthenticated: true, isAdmin, userName, isChecking: false });
        } else {
          setAuthState({ isAuthenticated: false, isAdmin: false, userName: "", isChecking: false });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthState({ isAuthenticated: false, isAdmin: false, userName: "", isChecking: false });
      }
    };
    checkAuth();
    const handleStorageChange = () => checkAuth();
    const handleAuthChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("barberAuthChange", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("barberAuthChange", handleAuthChange);
    };
  }, []);

  // Redirigir barberos normales de Caja
  useEffect(() => {
    if (authState.isAuthenticated && !authState.isAdmin && pathname === "/v2/caja") {
      router.push("/calendario");
    }
  }, [pathname, authState.isAuthenticated, authState.isAdmin, router]);

  const shouldHideNavBar = pathname?.startsWith("/login") || pathname?.startsWith("/registro");
  if (shouldHideNavBar || shouldHideCompletely) return null;

  // Tabs segÃºn rol
  let tabs: Tab[] = [];
  if (authState.isAuthenticated) {
    if (authState.isAdmin) {
      tabs = [
        { href: "/inicio", label: "Dashboard", icon: <IconHome className="w-5 h-5" /> },
        { href: "/agenda", label: "Agenda", icon: <IconCalendarCheck className="w-5 h-5" /> },
        { href: "/calendario", label: "Calendario", icon: <IconCalendar className="w-5 h-5" /> },
        { href: "/clientes", label: "Clientes", icon: <IconUsers className="w-5 h-5" /> },
        { href: "/whatsapp", label: "WhatsApp", icon: <IconMessageCircle className="w-5 h-5" /> },
        { href: "/caja", label: "Caja", icon: <IconDollarSign className="w-5 h-5" /> },
        { href: "/bloqueos", label: "Bloqueos", icon: <IconShield className="w-5 h-5" /> },
        { href: "/estadisticas", label: "Estadísticas", icon: <IconBarChart className="w-5 h-5" /> },
        { href: "/mi-barberia", label: "Mi Barbería", icon: <IconSettings className="w-5 h-5" /> },
      ];
    } else {
      tabs = [
        { href: "/inicio", label: "Dashboard", icon: <IconHome className="w-5 h-5" /> },
        { href: "/agenda", label: "Agenda", icon: <IconCalendarCheck className="w-5 h-5" /> },
        { href: "/calendario", label: "Calendario", icon: <IconCalendar className="w-5 h-5" /> },
        { href: "/whatsapp", label: "WhatsApp", icon: <IconMessageCircle className="w-5 h-5" /> },
      ];
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("barber_auth_session");
    document.cookie = "barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setAuthState({ isAuthenticated: false, isAdmin: false, userName: "", isChecking: false });
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent("barberAuthChange", { detail: { user: null, action: "logout" } }));
    router.push("/login");
  };

  if (authState.isChecking) {
    return (
      <nav className={`navbar ${isNavbarHidden ? 'navbar-hidden' : ''}`}>
        <div className="nav-container min-w-0">
          <div className="animate-pulse" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Cargando...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`navbar ${isNavbarHidden ? 'navbar-hidden' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Collapse Toggle Button (Desktop Only) */}
      {!shouldHideNavBar && !shouldHideCompletely && authState.isAuthenticated && (
        <button
          className="sidebar-collapse-btn hidden md:flex"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <div className="nav-container min-w-0">
        {/* Logo */}
        <Link
          href="/inicio"
          className="nav-logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 'auto',
            flexShrink: 0
          }}
        >
          {isSidebarCollapsed ? (
            <img
              src="/logo-barberox - B.png"
              alt="B"
              style={{
                height: '32px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          ) : (
            <img
              src="/logo-barberox.png"
              alt="Barberox"
              style={{
                height: '28px',
                width: 'auto',
                minWidth: '90px',
                objectFit: 'contain'
              }}
            />
          )}
        </Link>

        {/* Desktop: sidebar navigation links */}
        {authState.isAuthenticated && (
          <div className="hidden md:flex sidebar-nav-section">
            {tabs.map((t) => {
              const active = t.href === "/inicio"
                ? pathname === "/inicio" || pathname === "/" || pathname?.startsWith("/inicio/")
                : pathname?.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`nav-link uppercase tracking-widest text-xs rounded-none ${active ? 'active' : ''}`}
                  title={t.label}
                  style={{ fontFamily: 'var(--font-rasputin), serif' }}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Desktop: sidebar footer with user info */}
        <div className="hidden md:block sidebar-footer">
          {authState.isAuthenticated && (
            <>
              {/* Name Display (No link) */}
              <div
                className="nav-link"
                style={{ marginBottom: '4px', cursor: 'default' }}
                title="Usuario"
              >
                <span className="client-name" style={{
                  textTransform: 'none',
                  fontSize: '1.2rem',
                  letterSpacing: '0.05em',
                  paddingLeft: '10px'
                }}>
                  {formatBarberName(authState.userName) || 'Usuario'}
                </span>
              </div>

              {/* Profile link */}
              <Link
                href="/perfil"
                className={`nav-link w-full text-left uppercase tracking-widest text-xs rounded-none ${pathname?.startsWith('/perfil') ? 'active' : ''}`}
                style={{
                  fontFamily: 'var(--font-rasputin), serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 20px',
                  fontWeight: 500,
                  margin: '0 8px',
                }}
              >
                <svg className="profile-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <span>Mi Perfil</span>
              </Link>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="nav-link w-full text-left uppercase tracking-widest text-xs rounded-none"
                style={{
                  fontFamily: 'var(--font-rasputin), serif',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 20px',
                  fontWeight: 500,
                  margin: '0 8px',
                }}
              >
                <IconLogOut className="w-5 h-5" />
                <span>Cerrar sesión</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile: right-side controls */}
        <div className="ml-auto flex items-center gap-3 md:hidden">
          {authState.isAuthenticated && authState.userName && (
            <>
              <UserDropdownMenu
                userName={formatBarberName(authState.userName)}
                isAdmin={authState.isAdmin}
                onLogout={handleLogout}
              />
              <div className="md:hidden">
                <MobileMenu
                  isOpen={isMobileMenuOpen}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </>
          )}

          {!authState.isAuthenticated && (
            <Link href="/login" className="nav-link">
              Iniciar SesiÃ³n
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
