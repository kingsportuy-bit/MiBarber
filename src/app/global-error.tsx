'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-red-600">¡Algo salió mal!</h2>
            <p className="text-gray-700">
              Ocurrió un error inesperado en la aplicación. Nuestro equipo ha sido notificado y estamos trabajando para resolverlo.
            </p>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm text-gray-500">Detalles del error:</p>
              <p className="text-xs text-gray-700 mt-1">{error.message}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => reset()}
              >
                Intentar nuevamente
              </button>
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}