import { lazy, Suspense } from 'react';

export const dynamic = "force-dynamic";

const ConfiguracionInicialPageClient = lazy(() => import('./page.client'));

export default function ConfiguracionInicialPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfiguracionInicialPageClient />
    </Suspense>
  );
}