"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useRouter } from "next/navigation";

interface Tab {
  href: string;
  label: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isAdmin, barbero } = useBarberoAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(isOpen);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Definir items del menú basados en el rol del usuario
  const tabs = useMemo(() => {
    const baseItems: Tab[] = [
      { href: "/inicio", label: "Inicio" },
      { href: "/agenda", label: "Agenda" },
      { href: "/whatsapp", label: "WhatsApp" }
    ];
    
    // Para administradores, agregar items adicionales
    if (isAdmin) {
      baseItems.splice(2, 0, 
        { href: "/clientes", label: "Clientes" }
      );
    }
    
    return baseItems;
  }, [isAdmin]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    onClose();
  };

  const handleLogout = () => {
    // Eliminar sesión de localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem("barber_auth_session");
      // También eliminar la cookie
      document.cookie =
        "barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    // Cerrar el menú
    closeMenu();

    // Redirigir a la página de login
    router.push("/login");
  };

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="md:hidden">
      {/* Botón de menú hamburguesa */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-qoder-dark-text-primary hover:bg-qoder-dark-bg-hover focus:outline-none"
        aria-label="Menú"
        style={{ fontFamily: "'Roboto', 'Arial', sans-serif" }}
      >
        {menuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Menú desplegable */}
      {menuOpen && (
        <div ref={menuRef} className="dropdown-menu absolute top-12 left-0 right-0 z-50 animate-fadeInDown">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`dropdown-item flex items-center ${active ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {tab.label}
                </Link>
              );
            })}
            
            {barbero && (
              <>
                <Link
                  href="/mi-barberia"
                  className={`dropdown-item flex items-center ${
                    pathname === "/mi-barberia" ? 'active' : ''
                  }`}
                  onClick={closeMenu}
                >
                  Mi Barbería
                </Link>
                <Link
                  href="/mis-datos"
                  className={`dropdown-item flex items-center ${
                    pathname === "/mis-datos" ? 'active' : ''
                  }`}
                  onClick={closeMenu}
                >
                  Mis Datos
                </Link>
              </>
            )}
            
            {/* Botón de salir */}
            <button
              onClick={handleLogout}
              className="dropdown-item flex items-center w-full text-left"
            >
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}