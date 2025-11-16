"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

interface Tab {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isAdmin, barbero } = useBarberoAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(isOpen);
  
  // Definir items del menú basados en el rol del usuario
  const tabs = useMemo(() => {
    const baseItems: Tab[] = [
      { href: "/inicio", label: "Inicio", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )},
      { href: "/agenda", label: "Agenda", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )},
      { href: "/whatsapp", label: "WhatsApp", icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
        </svg>
      )}
    ];
    
    // Para administradores, agregar items adicionales
    if (isAdmin) {
      baseItems.splice(2, 0, 
        { href: "/clientes", label: "Clientes", icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        )}
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
        <div className="dropdown-menu absolute top-12 left-0 right-0 z-50 animate-fadeInDown">
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
                  <span className="mr-3">{tab.icon}</span>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.036-.687-.101-1.016A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  Mi Barbería
                </Link>
                <Link
                  href="/mis-datos"
                  className={`dropdown-item flex items-center ${
                    pathname === "/mis-datos" ? 'active' : ''
                  }`}
                  onClick={closeMenu}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.036-.687-.101-1.016A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  Mis Datos
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}