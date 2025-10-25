"use client";

import { useBarberosList } from "@/hooks/useBarberosList";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export function BarberFilter({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const { barbero, idBarberia } = useBarberoAuth();
  const { data: barberos, isLoading } = useBarberosList(idBarberia);
  
  console.log("BarberFilter - idBarberia:", idBarberia);
  console.log("BarberFilter - barberos:", barberos);
  
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-qoder-dark-text-secondary">Barbero:</label>
      <div className="relative w-48">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="qoder-dark-select w-full"
        >
          <option value="">Todos los barberos</option>
          {isLoading ? (
            <option value="" disabled>Cargando...</option>
          ) : (
            barberos?.map((barbero) => (
              <option key={barbero.id_barbero} value={barbero.nombre}>
                {barbero.nombre}
              </option>
            ))
          )}
        </select>
        {/* Flecha personalizada para el select */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-qoder-dark-text-primary">
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}