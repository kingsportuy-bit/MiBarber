"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  
  // Esta página ahora simplemente mostrará un mensaje
  // Todo el enrutamiento lo maneja el middleware
  return (
    <div className="min-h-screen flex items-center justify-center bg-qoder-dark-bg-primary">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary mx-auto mb-4"></div>
        <p className="text-qoder-dark-text-secondary">Redirigiendo...</p>
      </div>
    </div>
  );
}