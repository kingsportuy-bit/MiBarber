"use client";
import { useEffect, useState } from "react";

export function WhatsAppLayout({ children }: { children: React.ReactNode }) {
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
  
  return (
    <div className="flex flex-col h-screen w-full min-w-0 pb-16 md:pb-0">
      {children}
      {/* Espacio transparente para el menú inferior en móviles, excepto en vista individual de chat */}
      <div className={`h-16 md:hidden bg-transparent ${isChatView ? 'hidden' : ''}`}></div>
    </div>
  );
}