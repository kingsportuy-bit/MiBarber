"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

// SVG icons â€” refined for bottom nav
const IconCalendarCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);

const IconCalendar = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const IconMessageCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const IconUser = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMore = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isChatView, setIsChatView] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        setIsChatView(window.location.hash === '#chat-view');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // No mostrar en: no autenticado, admin, WhatsApp chat view, login
  if (!isAuthenticated || pathname?.startsWith('/admin') || pathname?.startsWith('/login') || (pathname?.startsWith('/whatsapp') && isChatView)) {
    return null;
  }

  // Barbero normal: Dashboard, Agenda, WhatsApp, Perfil
  // Admin: Dashboard, Agenda, WhatsApp, Más (sheet con opciones admin)
  const navItems: NavItem[] = isAdmin
    ? [
      { href: "/inicio", label: "Dashboard", icon: <IconCalendarCheck /> },
      { href: "/turnos", label: "Agenda", icon: <IconCalendar /> },
      { href: "/whatsapp", label: "WhatsApp", icon: <IconMessageCircle /> },
      { href: "#more", label: "Más", icon: <IconMore /> },
    ]
    : [
      { href: "/inicio", label: "Dashboard", icon: <IconCalendarCheck /> },
      { href: "/turnos", label: "Agenda", icon: <IconCalendar /> },
      { href: "/whatsapp", label: "WhatsApp", icon: <IconMessageCircle /> },
      { href: "/perfil", label: "Perfil", icon: <IconUser /> },
    ];

  const isActive = (href: string) => {
    if (href === "#more") return showMoreSheet;
    if (href === "/inicio") return pathname === href;
    if (href === "/turnos") return pathname === href;
    return pathname?.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    if (typeof window !== 'undefined' && window.location.hash) {
      window.location.hash = '';
    }
    if (href === "#more") {
      setShowMoreSheet(!showMoreSheet);
    } else {
      setShowMoreSheet(false);
    }
  };

  return (
    <>
      {/* "Más" bottom sheet overlay */}
      {showMoreSheet && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setShowMoreSheet(false)}
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="absolute bottom-16 left-0 right-0 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(17,17,17,0.98)',
              borderTop: '1px solid var(--qoder-dark-border-primary)',
              borderRadius: '16px 16px 0 0',
              padding: '12px 8px 8px',
            }}
          >
            {/* Handle bar */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />

            {[
              { href: "/caja", label: "Caja" },
              { href: "/clientes", label: "Clientes" },
              { href: "/estadisticas", label: "Estadísticas" },
              { href: "/mi-barberia", label: "Mi Barbería" },
              { href: "/perfil", label: "Perfil" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMoreSheet(false)}
                className="block"
                style={{
                  padding: '14px 20px',
                  color: pathname?.startsWith(item.href) ? '#C5A059' : 'rgba(255,255,255,0.8)',
                  fontSize: '0.9375rem',
                  fontWeight: pathname?.startsWith(item.href) ? 600 : 400,
                  borderRadius: '10px',
                  background: pathname?.startsWith(item.href) ? 'rgba(255,119,0,0.08)' : 'transparent',
                  textDecoration: 'none',
                  fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        <div
          className="flex justify-around items-center bottom-nav"
          style={{ height: 'var(--bottomnav-height, 64px)' }}
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            const isMoreButton = item.href === "#more";

            const content = (
              <div
                className={`flex flex-col items-center gap-0.5 w-full py-1.5 bottom-nav-item ${active ? "active" : ""
                  }`}
                style={{
                  color: active ? '#C5A059' : 'rgba(255,255,255,0.4)',
                  position: 'relative',
                }}
              >
                {/* Active indicator bar */}
                {active && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '25%',
                    right: '25%',
                    height: 2,
                    background: '#C5A059',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}
                <div style={{ color: active ? '#C5A059' : 'rgba(255,255,255,0.4)' }}>
                  {item.icon}
                </div>
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: active ? 600 : 500,
                  fontFamily: "'Inter', 'Roboto', -apple-system, sans-serif",
                  letterSpacing: '0.01em',
                }}>
                  {item.label}
                </span>
              </div>
            );

            if (isMoreButton) {
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0, textTransform: 'none', letterSpacing: 'normal' }}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                style={{ textDecoration: 'none', width: '100%' }}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
