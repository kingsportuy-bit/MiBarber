'use client'

import React from 'react'
import { useCliente } from '@/hooks/useClientes'

// Función para convertir puntaje a estrellas con borde dorado y sin relleno
const getStarsFromScore = (puntaje: number) => {
  // Para puntaje 0 y 1, mostrar 1 estrella
  // Para puntajes mayores, mostrar la cantidad correspondiente
  const starCount =
    puntaje <= 1 ? 1 : Math.min(5, Math.max(0, Math.floor(puntaje)))

  // Añadir solo estrellas vacías con borde dorado según el puntaje
  const stars = []
  for (let i = 0; i < starCount; i++) {
    stars.push(
      <span key={`star-${i}`} className="text-amber-400 text-sm">
        ☆
      </span>
    )
  }

  return <span className="tracking-wide">{stars}</span>
}

interface Props {
  idCliente: string
}

export function ClienteStars({ idCliente }: Props) {
  const { data: cliente } = useCliente(idCliente)

  if (!cliente || cliente.puntaje === null || cliente.puntaje === undefined) {
    return null
  }

  return getStarsFromScore(cliente.puntaje)
}