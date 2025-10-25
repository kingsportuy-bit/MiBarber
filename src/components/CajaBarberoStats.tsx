"use client";

import { useState, useEffect } from "react";
import { useBarberos } from "@/hooks/useBarberos";
import { StatCard } from "@/components/StatCard";

interface CajaBarberoStatsProps {
  barberoId: number | string | null | undefined;
}

export function CajaBarberoStats({ barberoId }: CajaBarberoStatsProps) {
  const { data: barberos, isLoading } = useBarberos();
  const [barberoName, setBarberoName] = useState<string>("");

  useEffect(() => {
    if (barberoId && barberos) {
      if (typeof barberoId === 'number') {
        // Si barberoId es un número, buscar por índice (no recomendado)
        const barbero = barberos[barberoId - 1];
        if (barbero) {
          setBarberoName(barbero.nombre);
        } else {
          setBarberoName(`ID: ${barberoId}`);
        }
      } else {
        // Si barberoId es string, buscar por id_barbero
        const barbero = barberos.find(b => b.id_barbero === barberoId);
        if (barbero) {
          setBarberoName(barbero.nombre);
        } else {
          setBarberoName(`ID: ${barberoId}`);
        }
      }
    } else {
      setBarberoName("No asignado");
    }
  }, [barberoId, barberos]);

  if (isLoading) {
    return (
      <div className="qoder-dark-card p-4">
        <p className="text-qoder-dark-text-primary">Cargando información del barbero...</p>
      </div>
    );
  }

  return (
    <div className="qoder-dark-card p-4">
      <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">
        Información del Barbero
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Nombre"
          value={barberoName}
          description="Barbero asignado"
        />
        <StatCard
          title="ID"
          value={barberoId ? String(barberoId) : "N/A"}
          description="Identificador único"
        />
        <StatCard
          title="Estado"
          value={barberoName !== "No asignado" ? "Activo" : "Sin asignar"}
          description="Estado del barbero"
        />
      </div>
    </div>
  );
}