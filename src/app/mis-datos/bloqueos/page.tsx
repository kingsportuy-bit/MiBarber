"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useRouter } from "next/navigation";

export default function BloqueosPage() {
  usePageTitle("Barberox | Mis Bloqueos");
  return <BloqueosContent />;
}

function BloqueosContent() {
  const router = useRouter();
  const { idBarberia } = useBarberoAuth();
  
  // Redirigir a la nueva página de bloqueos si hay idBarberia
  useEffect(() => {
    if (idBarberia) {
      router.push("/bloqueos");
    }
  }, [idBarberia, router]);

  // Si no hay ID de barbería, mostrar mensaje de acceso restringido
  if (!idBarberia) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-4">
            Acceso Restringido
          </h2>
          <p className="text-qoder-dark-text-secondary">
            Debe iniciar sesión para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // Mientras se redirige
  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-4">
          Redirigiendo...
        </h2>
        <p className="text-qoder-dark-text-secondary">
          Redirigiendo a la nueva página de bloqueos.
        </p>
      </div>
    </div>
  );
}