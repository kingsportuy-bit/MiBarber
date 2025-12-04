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

// Iconos SVG personalizados
const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PeopleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChatBubbleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const GearIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isChatView, setIsChatView] = useState(false);
  
  // Verificar si estamos en la vista individual de chat de WhatsApp
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        setIsChatView(window.location.hash === '#chat-view');
      }
    };
    
    // Verificar el hash inicial
    handleHashChange();
    
    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  // Si no hay un barbero logueado, estamos en la página de admin, o estamos en la vista individual de chat, no mostrar el menú inferior
  if (!isAuthenticated || pathname?.startsWith('/admin') || (pathname?.startsWith('/whatsapp') && isChatView)) {
    return null;
  }
  
  const navItems: NavItem[] = [
    { href: "/inicio", label: "Inicio", icon: <HomeIcon className="h-5 w-5" /> },
    { href: "/agenda", label: "Agenda", icon: <CalendarIcon className="h-5 w-5" /> },
    { href: "/clientes", label: "Clientes", icon: <PeopleIcon className="h-5 w-5" /> },
    { href: "/whatsapp", label: "WhatsApp", icon: <ChatBubbleIcon className="h-5 w-5" /> },
    { href: "/perfil", label: "Perfil", icon: <GearIcon className="h-5 w-5" /> },
  ];

  const isActive = (href: string) => {
    if (href === "/inicio") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Función para limpiar el hash al navegar
  const handleNavigation = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      window.location.hash = '';
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50">
      <div className="flex justify-around items-center h-16 bottom-nav">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavigation}
              className={`flex flex-col items-center gap-1 w-full py-2 bottom-nav-item ${
                active 
                  ? "text-orange-500 active" 
                  : "text-gray-400"
              }`}
            >
              <div className={active ? "text-orange-500" : "text-gray-400"}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}