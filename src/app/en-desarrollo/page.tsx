import { lazy, Suspense } from 'react';

export const dynamic = "force-dynamic";

const EnDesarrolloPageClient = lazy(() => import('./page.client'));

export default function EnDesarrolloPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EnDesarrolloPageClient />
    </Suspense>
  );
}