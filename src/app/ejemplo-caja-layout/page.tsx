'use client';

export default function EjemploCajaLayoutPage() {
  return (
    <div className="v2-container v2-main">
      <div className="mb-8">
        <h1 className="v2-heading mb-2">Ejemplo con Caja Layout</h1>
        <p className="v2-text-body text-[var(--text-muted)]">
          Esta página usa el CajaLayout que incluye automáticamente las tarjetas de caja
        </p>
      </div>
      
      {/* Contenido adicional */}
      <div className="v2-card">
        <h2 className="v2-subheading mb-4">Contenido de la Página</h2>
        <p className="v2-text-body mb-4">
          Esta página demuestra cómo se puede usar el CajaLayout para incluir automáticamente
          las tarjetas de resumen de caja en la parte superior de la página.
        </p>
        <ul className="v2-text-body space-y-2">
          <li>• Las tarjetas se muestran automáticamente gracias al layout</li>
          <li>• No es necesario importarlas en cada página</li>
          <li>• El layout maneja la lógica de autenticación y datos</li>
          <li>• Se puede reutilizar en múltiples páginas</li>
        </ul>
      </div>
    </div>
  );
}