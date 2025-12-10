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
    // Para administradores, solo mostrar páginas exclusivas de administrador
    if (isAdmin) {
      return [
        { href: "/caja", label: "Caja" },
        { href: "/estadisticas", label: "Estadísticas" },
        { href: "/mi-barberia", label: "Mi Barbería" }
      ];
    }
    
    // Para barberos normales, no mostrar páginas en el menú hamburguesa
    // ya que están disponibles en la navegación inferior
    return [];
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
      
      {/* Efecto de difuminado que ocupa toda la pantalla excepto el menú */}
      {menuOpen && (
        <>
          {/* Overlay difuminado para toda la pantalla */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
            onClick={closeMenu}
          />
          
          {/* Menú desplegable con recorte para evitar el difuminado en el área del menú */}
          <div 
            ref={menuRef} 
            className="dropdown-menu absolute top-12 left-0 right-0 z-50 animate-fadeInDown"
            style={{ backdropFilter: 'none' }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-qoder-dark-bg-secondary rounded-b-lg border border-qoder-dark-border-primary">
              {/* Nombre del barbero logueado */}
              {barbero && (
                <div className="px-3 py-2 text-qoder-dark-text-primary font-bold border-b border-qoder-dark-border">
                  {barbero.nombre}
                </div>
              )}
              
              {tabs.map((tab) => {
                const active = pathname === tab.href;
                // Verificar si la página es exclusiva de administradores
                const isAdminPage = tab.href === '/estadisticas' || tab.href === '/admin' || tab.href === '/admin/bloqueos' || tab.href === '/v2/caja' || tab.href === '/mi-barberia';
                
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`dropdown-item flex items-center justify-between ${active ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <span>{tab.label}</span>
                    {isAdminPage && isAdmin && (
                      <span className="text-[10px] bg-orange-500 text-white px-1 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </Link>
                );
              })}
              

              
              {/* Botón de cerrar sesión */}
              <button
                onClick={handleLogout}
                className="dropdown-item flex items-center w-full text-left capitalize"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}