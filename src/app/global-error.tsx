"use client";

export const dynamic = 'force-dynamic';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827' }}>
          <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '0.75rem', backgroundColor: '#1f2937', border: '1px solid #374151', maxWidth: '24rem', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
              ¡Ups! Algo salió mal
            </h2>
            <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
              Ocurrió un error inesperado en la aplicación.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}
                onClick={() => reset()}
              >
                Intentar nuevamente
              </button>
              <button
                style={{ padding: '0.5rem 1rem', backgroundColor: '#4b5563', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}
                onClick={() => window.location.href = "/"}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}