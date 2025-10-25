"use client";

import { useState } from "react";
import { useBarberos } from "@/hooks/useBarberos";
import type { Barbero } from "@/types/db";
import { toast } from "sonner";

interface BarberoNivelPermisosProps {
  barbero: Barbero;
  onUpdate: () => void;
  disabled?: boolean; // Nueva propiedad para deshabilitar la edición
}

export function BarberoNivelPermisos({ barbero, onUpdate, disabled }: BarberoNivelPermisosProps) {
  // Verificar si el barbero está protegido (nivel_permisos = 1)
  const isProtected = barbero.nivel_permisos === 1;
  
  return (
    <div className="flex items-center">
      <span className="text-sm">
        {barbero.admin ? "Administrador" : "Barbero Normal"}
        {isProtected && (
          <span className="text-xs text-gray-400 ml-2">
            (protegido)
          </span>
        )}
      </span>
    </div>
  );
}
