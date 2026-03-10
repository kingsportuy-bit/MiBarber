import { lazy, Suspense } from 'react';

export const dynamic = "force-dynamic";

const AgendaPageClient = lazy(() => import('./page.client'));

export default function AgendaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AgendaPageClient />
    </Suspense>
  );
}
