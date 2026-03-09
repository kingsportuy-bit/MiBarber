"use client";

import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { BloqueosTable } from "@/features/perfil/components/BloqueosTable";
import { DescansosList } from "@/features/perfil/components/DescansosList";

export default function BloqueosPage() {
    usePageTitle("Barberox | Bloqueos");
    const { barbero: barberoAuth, idBarberia } = useAuth();

    if (!barberoAuth || !idBarberia || !barberoAuth.id_sucursal) {
        return (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ color: "#8A8A8A", fontSize: "0.875rem", fontFamily: "var(--font-body)" }}>
                    Cargando datos...
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: "0 20px 24px", width: "100%", margin: "0 auto" }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: "1.5rem", margin: 0, letterSpacing: "0.04em" }}>
                    Bloqueos de Horarios
                </h1>
                <p style={{ color: "#8A8A8A", fontSize: "0.875rem", margin: "4px 0 0", fontFamily: "var(--font-body)" }}>
                    Administrá los bloqueos y descansos de tu agenda
                </p>
            </div>

            <BloqueosTable
                barberoId={barberoAuth.id_barbero}
                barberiaId={idBarberia}
                sucursalId={barberoAuth.id_sucursal}
            />

            <DescansosList
                barberoId={barberoAuth.id_barbero}
                barberiaId={idBarberia}
                sucursalId={barberoAuth.id_sucursal}
            />
        </div>
    );
}
