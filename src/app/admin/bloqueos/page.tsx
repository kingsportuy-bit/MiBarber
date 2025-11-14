export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation'

// Página simple para evitar errores de prerenderizado
// Redirige al login por defecto
export default function AdminBloqueosPage() {
  // Redirigir a la página de login
  redirect('/login')
}