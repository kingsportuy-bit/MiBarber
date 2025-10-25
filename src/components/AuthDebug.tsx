"use client";

export function AuthDebug() {
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-xs z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2">
          <span>Auth Debug: Componente cargado</span>
        </div>
      </div>
    </div>
  );
}