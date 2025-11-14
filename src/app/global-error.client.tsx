"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";

export default function GlobalErrorClient({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-qoder-dark-bg-primary">
      <div className="text-center p-8 rounded-xl bg-qoder-dark-bg-secondary border border-qoder-dark-border-primary max-w-md">
        <h2 className="text-2xl font-bold text-qoder-dark-text-primary mb-4">
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-qoder-dark-text-secondary mb-6">
          Ocurrió un error inesperado en la aplicación. Nuestro equipo ha sido notificado.
        </p>
        <div className="flex flex-col gap-3">
          <button
            className="qoder-dark-button-primary px-4 py-2 rounded-lg"
            onClick={() => reset()}
          >
            Intentar nuevamente
          </button>
          <button
            className="qoder-dark-button-secondary px-4 py-2 rounded-lg"
            onClick={() => window.location.href = "/"}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}