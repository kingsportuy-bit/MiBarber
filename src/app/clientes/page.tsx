import { lazy, Suspense } from 'react';

export const dynamic = "force-dynamic";

const ClientesPageClient = lazy(() => import('./page.client'));

export default function ClientesPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ClientesPageClient />
    </Suspense>
  );
}