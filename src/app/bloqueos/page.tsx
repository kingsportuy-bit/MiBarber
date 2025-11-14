import { lazy, Suspense } from 'react';

export const dynamic = "force-dynamic";

const BloqueosPageClient = lazy(() => import('./page.client'));

export default function BloqueosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <BloqueosPageClient />
    </Suspense>
  );
}