"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { BloqueosManager } from "@/components/bloqueos/BloqueosManager";
import { GlobalFilters } from "@/components/shared/GlobalFilters";

export default function BloqueosPage() {
  usePageTitle("Barberox | Bloqueos y Descansos");
  return <BloqueosContent />;
}

function BloqueosContent() {
  // Hook para la autenticación del barbero
  const { isAdmin, idBarberia, barbero } = useBarberoAuth();

  // Si no hay ID de barbería, redirigir
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

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-6">
        <section className="bg-qoder-dark-bg-secondary p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-qoder-dark-text-primary">
              Bloqueos y Descansos
            </h2>
          </div>

          {/* Filtros globales reutilizados */}
          <div className="mb-6">
            <GlobalFilters 
              showDateFilters={false}
            />
          </div>

          <div className="bg-qoder-dark-bg-primary rounded-xl p-6 border border-qoder-dark-border-primary">
            <BloqueosManager 
              mode={isAdmin ? "admin" : "barbero"} 
            />
          </div>
        </section>
      </div>
    </div>
  );
}