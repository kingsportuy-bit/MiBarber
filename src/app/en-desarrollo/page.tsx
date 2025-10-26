"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EnDesarrolloPage() {
  const router = useRouter();

  // Efecto para redirigir automáticamente después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/mibarber");
    }, 5000);

    // Limpiar el temporizador si el componente se desmonta
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-qoder-dark-bg-primary p-4">
      <div className="max-w-md w-full text-center">
        <div className="animate-pulse mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-24 w-24 mx-auto text-qoder-dark-accent-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-qoder-dark-text-primary mb-4">
          Página en Desarrollo
        </h1>
        
        <p className="text-qoder-dark-text-secondary mb-6">
          Esta sección está actualmente en desarrollo. Nuestro equipo está trabajando para brindarte la mejor experiencia posible.
        </p>
        
        <div className="bg-qoder-dark-bg-secondary rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-qoder-dark-text-primary mb-3">
            ¿Qué puedes hacer mientras tanto?
          </h2>
          <ul className="text-qoder-dark-text-secondary text-left space-y-2">
            <li className="flex items-start">
              <span className="text-qoder-dark-accent-primary mr-2">•</span>
              <span>Visita otras secciones de la aplicación</span>
            </li>
            <li className="flex items-start">
              <span className="text-qoder-dark-accent-primary mr-2">•</span>
              <span>Consulta tu agenda de citas</span>
            </li>
            <li className="flex items-start">
              <span className="text-qoder-dark-accent-primary mr-2">•</span>
              <span>Revisa tus clientes</span>
            </li>
            <li className="flex items-start">
              <span className="text-qoder-dark-accent-primary mr-2">•</span>
              <span>Explora el chat de WhatsApp</span>
            </li>
          </ul>
        </div>
        
        <div className="text-qoder-dark-text-secondary">
          <p className="mb-4">
            Serás redirigido automáticamente en 5 segundos...
          </p>
          <button
            onClick={() => router.push("/mibarber")}
            className="qoder-dark-button px-6 py-3 rounded-lg font-medium"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}