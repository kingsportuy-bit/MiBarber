"use client";

import { useState, useEffect } from "react";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

interface ChatSucursalFilterProps {
  onSucursalChange: (idSucursal: string | undefined) => void;
  initialSucursal?: string;
}

export function ChatSucursalFilter({ onSucursalChange, initialSucursal }: ChatSucursalFilterProps) {
  const { idBarberia } = useBarberoAuth();
  const { sucursales, isLoading } = useSucursales(idBarberia || undefined);
  const [selectedSucursal, setSelectedSucursal] = useState<string | undefined>(initialSucursal);

  useEffect(() => {
    if (initialSucursal !== undefined) {
      setSelectedSucursal(initialSucursal);
    }
  }, [initialSucursal]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "todas" ? undefined : e.target.value;
    setSelectedSucursal(value);
    onSucursalChange(value);
  };

  if (isLoading) {
    return (
      <div className="p-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-qoder-dark-accent-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-2 border-b border-qoder-dark-border-primary bg-qoder-dark-bg-quaternary">
      <select
        value={selectedSucursal || "todas"}
        onChange={handleChange}
        className="w-full qoder-dark-search-box py-2 px-3 text-qoder-dark-text-primary focus:outline-none rounded-lg"
      >
        <option value="todas">Todas las sucursales</option>
        {sucursales?.filter((sucursal: any) => sucursal.id_sucursal).map((sucursal: any) => (
          <option key={`sucursal-${sucursal.id_sucursal}`} value={sucursal.id_sucursal}>
            {sucursal.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}