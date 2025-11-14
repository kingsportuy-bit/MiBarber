"use client";

import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { BloqueosManager } from "@/components/bloqueos/BloqueosManager";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

export default function AdminBloqueosPageClient() {
  usePageTitle("Barberox | Gestión de Bloqueos");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Evitar prerenderizado en el servidor para evitar errores de almacenamiento
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminBloqueosContent />
    </AdminProtectedRoute>
  );
}

function AdminBloqueosContent() {
  // Hook para la autenticación del barbero
  const { isAdmin, idBarberia, barbero } = useBarberoAuth();

  // Si no hay ID de barbería o no es admin, redirigir
  if (!idBarberia || !isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-4">
            Acceso Restringido
          </h2>
          <p className="text-qoder-dark-text-secondary">
            Esta sección es solo para administradores.
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
              Gestión de Bloqueos y Descansos
            </h2>
          </div>

          <div className="bg-qoder-dark-bg-primary rounded-xl p-6 border border-qoder-dark-border-primary">
            <BloqueosManager mode="admin" />
          </div>
        </section>
      </div>
    </div>
  );
}