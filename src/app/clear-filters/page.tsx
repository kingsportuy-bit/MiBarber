'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearFiltersPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Limpiar los filtros guardados en localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('globalFilters')
      console.log('Filtros globales eliminados de localStorage')
      alert('Filtros globales eliminados. Serás redirigido a la página de estadísticas.')
      router.push('/estadisticas')
    }
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Limpiando filtros...</h1>
        <p>Eliminando filtros guardados en localStorage...</p>
      </div>
    </div>
  )
}