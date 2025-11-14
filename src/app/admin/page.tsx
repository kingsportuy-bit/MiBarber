import { lazy, Suspense } from 'react';

export const dynamic = "force-dynamic";

const AdminPageClient = lazy(() => import('./page.client'));

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AdminPageClient />
    </Suspense>
  );
}